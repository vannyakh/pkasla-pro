import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { userService } from './user.service';
import { buildSuccessResponse } from '@/helpers/http-response';

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const user = await userService.findByIdOrFail(userId!);
  return res.status(httpStatus.OK).json(buildSuccessResponse(user));
};

export const updateCurrentUserHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const updated = await userService.updateProfile(userId!, req.body);
  return res.status(httpStatus.OK).json(buildSuccessResponse(updated));
};

export const listUsersHandler = async (_req: Request, res: Response) => {
  const users = await userService.list();
  return res.status(httpStatus.OK).json(buildSuccessResponse(users));
};

