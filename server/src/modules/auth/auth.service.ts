import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users, type User } from '../../db/schema/index.js';
import type { AuthUser } from '../../types/express.js';
import { ApiError } from '../../utils/ApiError.js';
import { verifyPassword } from '../../utils/password.js';
import { getAdminPermissions } from '../permissions/permissions.service.js';
import type { LoginInput } from './auth.validation.js';

export function toPublicUser({ password: _password, ...user }: User) {
  return user;
}

export async function buildAuthUser(user: User): Promise<AuthUser> {
  const permissions = user.role === 'admin' ? await getAdminPermissions(user.id) : null;
  return { ...toPublicUser(user), permissions };
}

export async function login({ email, password }: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // same message for both cases so we don't reveal which emails exist
  if (!user || !(await verifyPassword(password, user.password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.status !== 'active') {
    throw ApiError.forbidden('Your account has been deactivated. Please contact an administrator.');
  }

  return buildAuthUser(user);
}

export async function getActiveUser(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user || user.status !== 'active') return null;
  return buildAuthUser(user);
}
