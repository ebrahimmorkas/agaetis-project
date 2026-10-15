import type { BadgeColor } from '@/components/ui'

export const ROLES = ['admin', 'manager', 'employee'] as const

export type Role = (typeof ROLES)[number]

export type Employee = {
  id: number
  name: string
  email: string
  role: Role
  createdAt: string
}

export type EmployeePayload = Pick<Employee, 'name' | 'email' | 'role'>

export type SortField = 'name' | 'email' | 'role' | 'createdAt'

export type EmployeeFilters = {
  page: number
  limit: number
  search?: string
  role?: Role
  sortBy: SortField
  order: 'asc' | 'desc'
}

export const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
}

export const roleColors: Record<Role, BadgeColor> = {
  admin: 'purple',
  manager: 'blue',
  employee: 'gray',
}

export const roleOptions = ROLES.map((role) => ({ value: role, label: roleLabels[role] }))
