import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse, usePageResponseSuccess } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { adminService } from './admin.service';
import { analyticsService } from './analytics.service';

// Dashboard & Analytics
export const getDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = analyticsService.getSiteMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

export const getUserMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getUserMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

// User Management
export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  const data = await adminService.listUsers(
    Number(page),
    Number(limit),
    { role: role as string, status: status as string, search: search as string },
  );
  return res.status(httpStatus.OK).json(usePageResponseSuccess(Number(page), Number(limit), data.data, { message: 'Users fetched successfully' }));
});

export const updateUserStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body.status);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

export const updateUserRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});
