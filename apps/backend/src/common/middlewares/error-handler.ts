import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { AppError } from '../errors/app-error';
import { logger } from '@/utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof AppError) {
    logger.warn({ err }, 'Operational error');
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  logger.error({ err }, 'Unexpected error');
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
  });
};

