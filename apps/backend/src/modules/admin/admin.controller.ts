import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { adminService } from './admin.service';
import { analyticsService } from './analytics.service';

// Dashboard & Analytics
export const getDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getSiteMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

export const getJobMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getJobMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

export const getUserMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getUserMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

export const getApplicationMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getApplicationMetrics();
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

export const getBehaviorMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
  const metrics = await analyticsService.getBehaviorMetrics(startDate, endDate);
  return res.status(httpStatus.OK).json(buildSuccessResponse(metrics));
});

// Job Approval Management
export const approveJobHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const job = await adminService.approveJob(req.params.id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(job));
});

export const rejectJobHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const job = await adminService.rejectJob(req.params.id, req.user.id, req.body.reason);
  return res.status(httpStatus.OK).json(buildSuccessResponse(job));
});

export const getPendingJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, ...meta } = await adminService.getPendingJobs(Number(page), Number(limit));
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

// Company Approval Management
export const approveCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const user = await adminService.approveCompany(req.params.id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

export const rejectCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const user = await adminService.rejectCompany(req.params.id, req.user.id, req.body.reason);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

export const getPendingCompaniesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, ...meta } = await adminService.getPendingCompanies(Number(page), Number(limit));
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

// User Management
export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  const { data, ...meta } = await adminService.listUsers(
    Number(page),
    Number(limit),
    { role: role as string, status: status as string, search: search as string },
  );
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const updateUserStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body.status);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

export const updateUserRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
});

// Job Management
export const listAllJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, approvalStatus, search } = req.query;
  const { data, ...meta } = await adminService.listAllJobs(
    Number(page),
    Number(limit),
    { status: status as string, approvalStatus: approvalStatus as string, search: search as string },
  );
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const deleteJobHandler = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteJob(req.params.id);
  return res.status(httpStatus.NO_CONTENT).send();
});

