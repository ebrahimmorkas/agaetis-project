import { z } from 'zod';
import { USER_STATUSES } from '../../db/schema/index.js';
import { paginationQuery } from '../../utils/pagination.js';

// super_admin is never assignable through the API
const assignableRoles = ['admin', 'manager', 'employee'] as const;

const name = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const email = z.email('Enter a valid email').trim().toLowerCase().max(255);
export const password = z.string().min(8, 'Password must be at least 8 characters').max(72);

const rolePermission = z.object({
  view: z.boolean(),
  add: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
});

const permissions = z.object({
  manager: rolePermission,
  employee: rolePermission,
});

export const createUserSchema = z.object({
  name,
  email,
  password,
  role: z.enum(assignableRoles),
  managerId: z.number().int().positive().nullable().optional(),
  permissions: permissions.optional(),
});

export const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  role: z.enum(assignableRoles).optional(),
  managerId: z.number().int().positive().nullable().optional(),
  permissions: permissions.optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
});

export const resetPasswordSchema = z.object({
  password,
});

export const listUsersQuery = paginationQuery.extend({
  search: z.string().trim().optional(),
  role: z.enum(assignableRoles).optional(),
  status: z.enum(USER_STATUSES).optional(),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuery>;
