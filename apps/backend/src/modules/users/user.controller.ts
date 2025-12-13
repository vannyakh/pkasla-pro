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

export const listUsersHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  
  const result = await userService.list(page, pageSize);
  return res.status(httpStatus.OK).json(result);
};

export const updateTelegramHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const updated = await userService.updateTelegram(userId!, req.body);
  return res.status(httpStatus.OK).json(buildSuccessResponse(updated, 'Telegram connected successfully'));
};

export const disconnectTelegramHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const updated = await userService.disconnectTelegram(userId!);
  return res.status(httpStatus.OK).json(buildSuccessResponse(updated, 'Telegram disconnected successfully'));
};

export const getTelegramBotStatusHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const status = await userService.getTelegramBotStatus(userId!);
  return res.status(httpStatus.OK).json(buildSuccessResponse(status, 'Telegram bot status fetched successfully'));
};

