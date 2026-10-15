import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type Schemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validate = (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
  for (const key of ['body', 'params', 'query'] as const) {
    const schema = schemas[key];
    if (!schema) continue;

    const result = schema.safeParse(req[key]);
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed', z.flattenError(result.error).fieldErrors));
    }

    // req.query is a getter in Express 5, so it can't be reassigned directly
    Object.defineProperty(req, key, { value: result.data, writable: true });
  }

  next();
};
