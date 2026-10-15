import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../db/schema/index.js';
import { getActiveUser } from '../modules/auth/auth.service.js';
import { ApiError } from '../utils/ApiError.js';
import { AUTH_COOKIE, verifyToken } from '../utils/token.js';

// The user is loaded fresh on every request so deactivations and
// permission changes take effect straight away.
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return next(ApiError.unauthorized('Please log in to continue'));

  const user = await getActiveUser(payload.sub);
  if (!user) return next(ApiError.unauthorized('Your session has expired. Please log in again.'));

  req.user = user;
  next();
}

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to do this'));
    }
    next();
  };
