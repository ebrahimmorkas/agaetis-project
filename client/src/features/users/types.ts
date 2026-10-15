import type { PermissionMap, Role, UserStatus } from '@/features/auth/types'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  status: UserStatus
  managerId: number | null
  manager: { id: number; name: string } | null
  createdAt: string
  permissions?: PermissionMap | null
}

export type AssignableRole = Exclude<Role, 'super_admin'>

export type SortField = 'name' | 'email' | 'role' | 'status' | 'createdAt'

export type UserFilters = {
  page: number
  limit: number
  search?: string
  role?: AssignableRole
  status?: UserStatus
  sortBy: SortField
  order: 'asc' | 'desc'
}

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role: AssignableRole
  managerId?: number | null
  permissions?: PermissionMap
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>

export type ManagerOption = {
  id: number
  name: string
  email: string
}
