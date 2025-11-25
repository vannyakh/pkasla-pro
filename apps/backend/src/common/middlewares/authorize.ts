import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { AppError } from '../errors/app-error';
import type { UserRole } from '@/modules/users/user.types';

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', httpStatus.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', httpStatus.FORBIDDEN));
    }

    return next();
  };

