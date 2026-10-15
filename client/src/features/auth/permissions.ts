import type { AuthUser, ManagedRole, PermissionAction, PermissionMap, Role } from './types'

export const MANAGED_ROLES: ManagedRole[] = ['manager', 'employee']

export const noPermissions = (): PermissionMap => ({
  manager: { view: false, add: false, edit: false, delete: false },
  employee: { view: false, add: false, edit: false, delete: false },
})

// Mirrors the server rules in users.access.ts. The server is still the
// source of truth - this only decides what to show in the UI.
export function canManageRole(user: AuthUser, role: Role, action: PermissionAction) {
  if (role === 'super_admin') return false
  if (user.role === 'super_admin') return true
  if (user.role === 'admin' && (role === 'manager' || role === 'employee')) {
    return user.permissions?.[role][action] ?? false
  }
  return false
}

export function rolesWith(user: AuthUser, action: PermissionAction): Role[] {
  const roles: Role[] = user.role === 'super_admin' ? ['admin', ...MANAGED_ROLES] : MANAGED_ROLES
  return roles.filter((role) => canManageRole(user, role, action))
}

export function hasAnyUserAccess(user: AuthUser) {
  if (user.role === 'super_admin') return true
  if (user.role !== 'admin' || !user.permissions) return false
  return MANAGED_ROLES.some((role) => Object.values(user.permissions![role]).some(Boolean))
}
