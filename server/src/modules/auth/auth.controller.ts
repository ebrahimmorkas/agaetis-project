import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.js';
import { AUTH_COOKIE, authCookieOptions, signToken } from '../../utils/token.js';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response) {
  const user = await authService.login(req.body);
  res.cookie(AUTH_COOKIE, signToken(user.id), authCookieOptions);
  sendSuccess(res, user, 'Logged in');
}

export function logout(_req: Request, res: Response) {
  const { maxAge: _maxAge, ...options } = authCookieOptions;
  res.clearCookie(AUTH_COOKIE, options);
  sendSuccess(res, null, 'Logged out');
}

export function me(req: Request, res: Response) {
  sendSuccess(res, req.user);
}
