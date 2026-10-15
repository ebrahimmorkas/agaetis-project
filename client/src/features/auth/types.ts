import type { BadgeColor } from '@/components/ui'

export type Role = 'super_admin' | 'admin' | 'manager' | 'employee'
export type ManagedRole = 'manager' | 'employee'
export type UserStatus = 'active' | 'inactive'

export type PermissionAction = 'view' | 'add' | 'edit' | 'delete'
export type RolePermission = Record<PermissionAction, boolean>
export type PermissionMap = Record<ManagedRole, RolePermission>

export type AuthUser = {
  id: number
  name: string
  email: string
  role: Role
  status: UserStatus
  managerId: number | null
  createdAt: string
  permissions: PermissionMap | null
}

export const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
}

export const roleColors: Record<Role, BadgeColor> = {
  super_admin: 'red',
  admin: 'purple',
  manager: 'blue',
  employee: 'gray',
}
