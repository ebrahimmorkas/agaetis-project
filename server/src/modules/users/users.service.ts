import { and, asc, desc, eq, getTableColumns, like, ne, or, type SQL } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPaginationMeta } from '../../utils/pagination.js';
import { hashPassword } from '../../utils/password.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './users.validation.js';

const { password: _password, ...publicColumns } = getTableColumns(users);

async function ensureEmailIsFree(email: string, excludeId?: number) {
  const conditions = [eq(users.email, email)];
  if (excludeId) conditions.push(ne(users.id, excludeId));

  const [existing] = await db.select({ id: users.id }).from(users).where(and(...conditions)).limit(1);
  if (existing) {
    throw ApiError.conflict('An employee with this email already exists');
  }
}

export async function listUsers({ page, limit, search, role, sortBy, order }: ListUsersQuery) {
  const filters: SQL[] = [];

  if (search) {
    const term = `%${search}%`;
    filters.push(or(like(users.name, term), like(users.email, term))!);
  }
  if (role) filters.push(eq(users.role, role));

  const where = filters.length ? and(...filters) : undefined;
  const sortDirection = order === 'asc' ? asc : desc;

  const [items, total] = await Promise.all([
    db
      .select(publicColumns)
      .from(users)
      .where(where)
      .orderBy(sortDirection(users[sortBy]), desc(users.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.$count(users, where),
  ]);

  return { items, meta: getPaginationMeta(total, page, limit) };
}

export async function getUserById(id: number) {
  const [user] = await db.select(publicColumns).from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw ApiError.notFound('Employee not found');
  return user;
}

export async function createUser(data: CreateUserInput) {
  await ensureEmailIsFree(data.email);

  const [created] = await db
    .insert(users)
    .values({ ...data, password: await hashPassword(data.password) })
    .$returningId();
  return getUserById(created!.id);
}

export async function updateUser(id: number, data: UpdateUserInput) {
  await getUserById(id);
  if (data.email) await ensureEmailIsFree(data.email, id);

  if (Object.keys(data).length) {
    await db.update(users).set(data).where(eq(users.id, id));
  }
  return getUserById(id);
}

export async function deleteUser(id: number) {
  await getUserById(id);
  await db.delete(users).where(eq(users.id, id));
}
