import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import httpStatus from 'http-status';

export const validateRequest =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }

    const payload = result.data as { body?: unknown; params?: unknown; query?: unknown };

    if (payload.body !== undefined) {
      req.body = payload.body as typeof req.body;
    }
    if (payload.params !== undefined) {
      req.params = payload.params as typeof req.params;
    }
    // Merge validated query into existing query object instead of replacing it
    // Use type assertion to allow mutation since Express query is mutable at runtime
    if (payload.query !== undefined) {
      Object.assign(req.query as Record<string, unknown>, payload.query);
    }
    
    return next();
  };

