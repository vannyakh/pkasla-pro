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
      const formattedErrors: {
        formErrors: string[];
        fieldErrors: Record<string, string[]>;
      } = {
        formErrors: [],
        fieldErrors: {},
      };

      // Process Zod errors to show proper field paths
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        
        // If path starts with 'body.', extract just the field name
        if (path.startsWith('body.')) {
          const fieldName = path.replace('body.', '');
          if (!formattedErrors.fieldErrors[fieldName]) {
            formattedErrors.fieldErrors[fieldName] = [];
          }
          formattedErrors.fieldErrors[fieldName].push(issue.message);
        } else if (path === 'body') {
          // Handle body-level errors
          if (!formattedErrors.fieldErrors[path]) {
            formattedErrors.fieldErrors[path] = [];
          }
          formattedErrors.fieldErrors[path].push(issue.message);
        } else {
          // Handle params, query, or other paths
          if (!formattedErrors.fieldErrors[path]) {
            formattedErrors.fieldErrors[path] = [];
          }
          formattedErrors.fieldErrors[path].push(issue.message);
        }
      });

      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors,
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

