import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { privacyService } from './privacy.service';

export const exportUserDataHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const data = await privacyService.exportUserData(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data));
});

export const deleteUserDataHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const result = await privacyService.deleteUserData(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
});

export const anonymizeUserDataHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const result = await privacyService.anonymizeUserData(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
});

export const getDataRetentionInfoHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const info = await privacyService.getDataRetentionInfo(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(info));
});

export const requestDataDeletionHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const result = await privacyService.requestDataDeletion(req.user.id, req.body.reason);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
});

