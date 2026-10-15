import { and, eq, inArray, ne, type SQL } from 'drizzle-orm';
import { MANAGED_ROLES, users, type ManagedRole, type UserRole } from '../../db/schema/index.js';
import type { AuthUser } from '../../types/express.js';
import type { PermissionAction } from '../permissions/permissions.service.js';

const isManagedRole = (role: UserRole): role is ManagedRole => (MANAGED_ROLES as readonly string[]).includes(role);

/**
 * Super admin can do anything to anyone except another super admin.
 * Admins are limited to managers/employees, and only for the actions
 * the super admin has granted them.
 */
export function canManageRole(actor: AuthUser, role: UserRole, action: PermissionAction) {
  if (role === 'super_admin') return false;
  if (actor.role === 'super_admin') return true;
  if (actor.role === 'admin' && isManagedRole(role)) {
    return actor.permissions?.[role][action] ?? false;
  }
  return false;
}

export function isOwnEmployee(actor: AuthUser, target: { role: UserRole; managerId: number | null }) {
  return actor.role === 'manager' && target.role === 'employee' && target.managerId === actor.id;
}

export function canViewUser(actor: AuthUser, target: { role: UserRole; managerId: number | null }) {
  return canManageRole(actor, target.role, 'view') || isOwnEmployee(actor, target);
}

// Returns null when the actor isn't allowed to see anyone
export function visibleUsersFilter(actor: AuthUser): SQL | null {
  switch (actor.role) {
    case 'super_admin':
      return ne(users.role, 'super_admin');
    case 'admin': {
      const roles = MANAGED_ROLES.filter((role) => canManageRole(actor, role, 'view'));
      return roles.length ? inArray(users.role, roles) : null;
    }
    case 'manager':
      return and(eq(users.role, 'employee'), eq(users.managerId, actor.id))!;
    default:
      return null;
  }
}
