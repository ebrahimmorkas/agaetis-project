import { and, asc, desc, eq, getTableColumns, like, ne, or, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/mysql-core';
import { db } from '../../db/index.js';
import { adminPermissions, users, type UserRole, type UserStatus } from '../../db/schema/index.js';
import type { AuthUser } from '../../types/express.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPaginationMeta } from '../../utils/pagination.js';
import { hashPassword } from '../../utils/password.js';
import { emptyPermissions, getAdminPermissions, saveAdminPermissions } from '../permissions/permissions.service.js';
import { canManageRole, canViewUser, isOwnEmployee, visibleUsersFilter } from './users.access.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './users.validation.js';

const { password: _password, ...publicColumns } = getTableColumns(users);
const manager = alias(users, 'manager');

const userWithManager = {
  ...publicColumns,
  manager: { id: manager.id, name: manager.name },
};

const forbidden = () => ApiError.forbidden('You do not have permission to do this');

async function findUser(id: number) {
  const [user] = await db
    .select(userWithManager)
    .from(users)
    .leftJoin(manager, eq(users.managerId, manager.id))
    .where(eq(users.id, id))
    .limit(1);
  return user;
}

async function ensureEmailIsFree(email: string, excludeId?: number) {
  const conditions = [eq(users.email, email)];
  if (excludeId) conditions.push(ne(users.id, excludeId));

  const [existing] = await db.select({ id: users.id }).from(users).where(and(...conditions)).limit(1);
  if (existing) throw ApiError.conflict('A user with this email already exists');
}

async function ensureValidManager(managerId: number) {
  const [found] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, managerId), eq(users.role, 'manager'), eq(users.status, 'active')))
    .limit(1);
  if (!found) throw ApiError.badRequest('Selected manager does not exist or is inactive');
}

// Loads a user and makes sure the actor is allowed to see them.
// Returns 404 rather than 403 so we don't leak which ids exist.
async function getVisibleUser(actor: AuthUser, id: number) {
  const user = await findUser(id);
  if (!user || user.id === actor.id || !canViewUser(actor, user)) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

export async function listUsers(actor: AuthUser, query: ListUsersQuery) {
  const { page, limit, search, role, status, sortBy, order } = query;
  const scope = visibleUsersFilter(actor);

  if (!scope) {
    return { items: [], meta: getPaginationMeta(0, page, limit) };
  }

  const filters: SQL[] = [scope];
  if (search) {
    const term = `%${search}%`;
    filters.push(or(like(users.name, term), like(users.email, term))!);
  }
  if (role) filters.push(eq(users.role, role));
  if (status) filters.push(eq(users.status, status));

  const where = and(...filters);
  const sortDirection = order === 'asc' ? asc : desc;

  const [items, total] = await Promise.all([
    db
      .select(userWithManager)
      .from(users)
      .leftJoin(manager, eq(users.managerId, manager.id))
      .where(where)
      .orderBy(sortDirection(users[sortBy]), desc(users.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.$count(users, where),
  ]);

  return { items, meta: getPaginationMeta(total, page, limit) };
}

async function withPermissions<T extends { id: number; role: UserRole }>(user: T) {
  const permissions = user.role === 'admin' ? await getAdminPermissions(user.id) : null;
  return { ...user, permissions };
}

export async function getUser(actor: AuthUser, id: number) {
  return withPermissions(await getVisibleUser(actor, id));
}

// used to fill the "assign manager" dropdown
export async function listManagerOptions(actor: AuthUser) {
  if (!canManageRole(actor, 'employee', 'add') && !canManageRole(actor, 'employee', 'edit')) throw forbidden();

  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.role, 'manager'), eq(users.status, 'active')))
    .orderBy(asc(users.name));
}

export async function createUser(actor: AuthUser, data: CreateUserInput) {
  if (!canManageRole(actor, data.role, 'add')) throw forbidden();
  if (data.role === 'admin' && actor.role !== 'super_admin') throw forbidden();

  await ensureEmailIsFree(data.email);

  const managerId = data.role === 'employee' ? (data.managerId ?? null) : null;
  if (managerId) await ensureValidManager(managerId);

  const [created] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      role: data.role,
      managerId,
    })
    .$returningId();

  if (data.role === 'admin') {
    await saveAdminPermissions(created!.id, data.permissions ?? emptyPermissions());
  }

  // not getUser(): an admin with add-only access still gets back what they just created
  return withPermissions((await findUser(created!.id))!);
}

export async function updateUser(actor: AuthUser, id: number, data: UpdateUserInput) {
  const target = await getVisibleUser(actor, id);

  if (actor.role === 'manager') {
    // managers can only touch basic details of their own team
    if (!isOwnEmployee(actor, target)) throw forbidden();
    if (data.role !== undefined || data.managerId !== undefined || data.permissions) throw forbidden();
  } else {
    if (!canManageRole(actor, target.role, 'edit')) throw forbidden();
    if (data.role && data.role !== target.role && !canManageRole(actor, data.role, 'edit')) throw forbidden();
    if (data.permissions && actor.role !== 'super_admin') throw forbidden();
  }

  const nextRole: UserRole = data.role ?? target.role;

  if (data.email) await ensureEmailIsFree(data.email, id);

  const changes: Partial<typeof users.$inferInsert> = {};
  if (data.name !== undefined) changes.name = data.name;
  if (data.email !== undefined) changes.email = data.email;
  if (data.role !== undefined) changes.role = data.role;

  if (nextRole !== 'employee') {
    changes.managerId = null;
  } else if (data.managerId !== undefined) {
    if (data.managerId) await ensureValidManager(data.managerId);
    changes.managerId = data.managerId;
  }

  await db.transaction(async (tx) => {
    if (Object.keys(changes).length) {
      await tx.update(users).set(changes).where(eq(users.id, id));
    }

    // a manager who is moved to another role leaves their team without a manager
    if (target.role === 'manager' && nextRole !== 'manager') {
      await tx.update(users).set({ managerId: null }).where(eq(users.managerId, id));
    }
    if (target.role === 'admin' && nextRole !== 'admin') {
      await tx.delete(adminPermissions).where(eq(adminPermissions.adminId, id));
    }
  });

  if (nextRole === 'admin' && (data.permissions || target.role !== 'admin')) {
    await saveAdminPermissions(id, data.permissions ?? emptyPermissions());
  }

  return getUser(actor, id);
}

export async function setUserStatus(actor: AuthUser, id: number, status: UserStatus) {
  const target = await getVisibleUser(actor, id);
  if (!canManageRole(actor, target.role, 'delete')) throw forbidden();

  await db.update(users).set({ status }).where(eq(users.id, id));
  return getUser(actor, id);
}

export async function resetPassword(actor: AuthUser, id: number, password: string) {
  if (actor.role !== 'super_admin') throw forbidden();
  await getVisibleUser(actor, id);

  await db
    .update(users)
    .set({ password: await hashPassword(password) })
    .where(eq(users.id, id));
}
