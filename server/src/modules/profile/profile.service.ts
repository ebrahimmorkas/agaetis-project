import { and, eq, ne } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { getActiveUser } from '../auth/auth.service.js';
import type { ChangePasswordInput, UpdateProfileInput } from './profile.validation.js';

export async function updateProfile(userId: number, data: UpdateProfileInput) {
  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, data.email), ne(users.id, userId)))
    .limit(1);
  if (taken) throw ApiError.conflict('A user with this email already exists');

  await db.update(users).set(data).where(eq(users.id, userId));
  return getActiveUser(userId);
}

export async function changePassword(userId: number, { currentPassword, newPassword }: ChangePasswordInput) {
  const [user] = await db.select({ password: users.password }).from(users).where(eq(users.id, userId)).limit(1);

  if (!user || !(await verifyPassword(currentPassword, user.password))) {
    throw ApiError.badRequest('Current password is incorrect', { currentPassword: ['Current password is incorrect'] });
  }

  await db
    .update(users)
    .set({ password: await hashPassword(newPassword) })
    .where(eq(users.id, userId));
}
