import type { Request, Response } from 'express';
import httpStatus from 'http-status';

export const notFoundHandler = (_req: Request, res: Response): Response =>
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Resource not found',
  });

