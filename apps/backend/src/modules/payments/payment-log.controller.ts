import type { Request, Response, RequestHandler } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { paymentLogService } from './payment-log.service';
import { logger } from '@/utils/logger';

/**
 * Get payment logs with filters
 */
export const listPaymentLogsHandler: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  
  const filters = {
    userId: req.query.userId as string | undefined,
    transactionId: req.query.transactionId as string | undefined,
    paymentMethod: req.query.paymentMethod as 'stripe' | 'bakong' | undefined,
    paymentType: req.query.paymentType as 'subscription' | 'template' | undefined,
    eventType: req.query.eventType as string | undefined,
    status: req.query.status as 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled' | undefined,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    search: req.query.search as string | undefined,
  };

  logger.info({
    adminId: req.user?.id,
    filters,
    page,
    limit,
  }, 'Admin viewing payment logs');

  const result = await paymentLogService.list(filters, page, limit);

  return res.status(httpStatus.OK).json(
    buildSuccessResponse(result, 'Payment logs fetched successfully')
  );
});

/**
 * Get payment log by ID
 */
export const getPaymentLogHandler: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  logger.info({
    adminId: req.user?.id,
    paymentLogId: id,
  }, 'Admin viewing payment log details');

  const paymentLog = await paymentLogService.findById(id);

  if (!paymentLog) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Payment log not found',
    });
  }

  return res.status(httpStatus.OK).json(
    buildSuccessResponse(paymentLog, 'Payment log fetched successfully')
  );
});

/**
 * Get payment log statistics
 */
export const getPaymentLogStatsHandler: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    userId: req.query.userId as string | undefined,
    transactionId: req.query.transactionId as string | undefined,
    paymentMethod: req.query.paymentMethod as 'stripe' | 'bakong' | undefined,
    paymentType: req.query.paymentType as 'subscription' | 'template' | undefined,
    eventType: req.query.eventType as string | undefined,
    status: req.query.status as 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled' | undefined,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
  };

  logger.info({
    adminId: req.user?.id,
    filters,
  }, 'Admin viewing payment log statistics');

  const stats = await paymentLogService.getStats(filters);

  return res.status(httpStatus.OK).json(
    buildSuccessResponse(stats, 'Payment log statistics fetched successfully')
  );
});

