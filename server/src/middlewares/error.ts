import type { NextFunction, Request, Response } from 'express';
import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
  });
}
