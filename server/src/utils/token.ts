import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProduction } from '../config/env.js';

export const AUTH_COOKIE = 'token';

type TokenPayload = {
  sub: number;
};

export function signToken(userId: number) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: `${env.JWT_EXPIRES_IN_DAYS}d` });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === 'string' || !payload.sub) return null;
    return { sub: Number(payload.sub) };
  } catch {
    return null;
  }
}

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: env.JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};
