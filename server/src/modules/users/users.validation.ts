import { z } from 'zod';
import { paginationQuery } from '../../utils/pagination.js';

const assignableRoles = ['admin', 'manager', 'employee'] as const;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Enter a valid email').trim().toLowerCase().max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  role: z.enum(assignableRoles).default('employee'),
});

export const updateUserSchema = createUserSchema.omit({ password: true }).partial();

export const listUsersQuery = paginationQuery.extend({
  search: z.string().trim().optional(),
  role: z.enum(assignableRoles).optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuery>;
