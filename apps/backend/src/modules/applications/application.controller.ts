import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { applicationService } from './application.service';

export const createApplicationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const application = await applicationService.create(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(application));
});

export const getApplicationHandler = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.findById(req.params.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(application));
});

export const updateApplicationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const application = await applicationService.update(req.params.id, req.body, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(application));
});

export const deleteApplicationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  await applicationService.remove(req.params.id, req.user.id);
  return res.status(httpStatus.NO_CONTENT).send();
});

export const getJobApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, ...meta } = await applicationService.findByJobId(
    req.params.jobId,
    Number(page),
    Number(limit),
  );
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const getMyApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const { page = 1, limit = 20 } = req.query;
  const { data, ...meta } = await applicationService.findByCandidateId(
    req.user.id,
    Number(page),
    Number(limit),
  );
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const updateApplicationStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const application = await applicationService.updateStatus(
    req.params.id,
    req.body.status,
    req.user.id,
  );
  return res.status(httpStatus.OK).json(buildSuccessResponse(application));
});

export const getApplicationStatsHandler = asyncHandler(async (req: Request, res: Response) => {
  const stats = await applicationService.getStats(req.query.jobId as string | undefined);
  return res.status(httpStatus.OK).json(buildSuccessResponse(stats));
});

