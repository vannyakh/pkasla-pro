import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { authService } from './auth.service';
import { buildSuccessResponse } from '@/helpers/http-response';

export const registerHandler = async (req: Request, res: Response) => {
  const result = await authService.register(req.body, req);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(result));
};

export const loginHandler = async (req: Request, res: Response) => {
  const result = await authService.login(req.body, req);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const verifyTwoFactorLoginHandler = async (req: Request, res: Response) => {
  const result = await authService.verifyTwoFactorLogin(req.body.token, req);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const setupTwoFactorHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required',
    });
  }
  const result = await authService.setupTwoFactor(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const verifyTwoFactorSetupHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required',
    });
  }
  const result = await authService.verifyTwoFactorSetup(req.user.id, req.body.token);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const disableTwoFactorHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required',
    });
  }
  const result = await authService.disableTwoFactor(req.user.id, req.body.password);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body, req);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const logoutHandler = async (req: Request, res: Response) => {
  await authService.logout(req);
  return res.status(httpStatus.OK).json(buildSuccessResponse({ message: 'Logged out successfully' }));
};

export const providerLoginHandler = async (req: Request, res: Response) => {
  const result = await authService.providerLogin(req.body, req);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

