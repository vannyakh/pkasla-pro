import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { adminService } from './admin.service';
import { analyticsService } from './analytics.service';

// Dashboard & Analytics
export const getDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getSiteMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

export const getUserMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getUserMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

// User Management
export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const role = req.query.role as string | undefined;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  
  const result = await adminService.listUsers(
    page,
    limit,
    { role, status, search },
  );
  
  return res.status(httpStatus.OK).json(
    buildSuccessResponse(result, 'Users fetched successfully')
  );
});

export const updateUserStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body.status);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

export const updateUserRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

// Cache Management
export const clearCacheHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.clearCache();
  return res.status(httpStatus.OK).json(
    buildSuccessResponse(result, 'Cache cleared successfully')
  );
});
