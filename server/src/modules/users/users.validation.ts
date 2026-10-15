import { z } from 'zod';
import { USER_ROLES } from '../../db/schema/index.js';
import { paginationQuery } from '../../utils/pagination.js';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Enter a valid email').trim().toLowerCase().max(255),
  role: z.enum(USER_ROLES).default('employee'),
});

export const updateUserSchema = createUserSchema.partial();

export const listUsersQuery = paginationQuery.extend({
  search: z.string().trim().optional(),
  role: z.enum(USER_ROLES).optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuery>;
