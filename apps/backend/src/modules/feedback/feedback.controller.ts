import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { feedbackService } from './feedback.service';

export const createFeedbackHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const feedback = await feedbackService.create(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(feedback));
});

export const listFeedbacksHandler = asyncHandler(async (req: Request, res: Response) => {
  const { data, ...meta } = await feedbackService.list(req.query);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const getFeedbackHandler = asyncHandler(async (req: Request, res: Response) => {
  const feedback = await feedbackService.findById(req.params.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(feedback));
});

export const updateFeedbackHandler = asyncHandler(async (req: Request, res: Response) => {
  const feedback = await feedbackService.update(req.params.id, req.body);
  return res.status(httpStatus.OK).json(buildSuccessResponse(feedback));
});

export const respondToFeedbackHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const feedback = await feedbackService.respondToFeedback(req.params.id, req.body, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(feedback));
});

export const deleteFeedbackHandler = asyncHandler(async (req: Request, res: Response) => {
  await feedbackService.remove(req.params.id);
  return res.status(httpStatus.NO_CONTENT).send();
});

export const getUserFeedbacksHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const { data, ...meta } = await feedbackService.findByUserId(req.user.id, req.query);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

