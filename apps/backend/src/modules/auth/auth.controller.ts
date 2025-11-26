import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { authService } from './auth.service';
import { buildSuccessResponse, useResponseError } from '@/helpers/http-response';
import { AppError } from '@/common/errors/app-error';

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
    return res.status(httpStatus.UNAUTHORIZED).json(useResponseError('Authentication required'));
  }
  const result = await authService.setupTwoFactor(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const verifyTwoFactorSetupHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json(useResponseError('Authentication required'));
  }
  const result = await authService.verifyTwoFactorSetup(req.user.id, req.body.token);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const disableTwoFactorHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json(useResponseError('Authentication required'));
  }
  const result = await authService.disableTwoFactor(req.user.id, req.body.password);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body, req);
  // For refresh token, we need to return tokens in the expected format
  return res.status(httpStatus.OK).json(buildSuccessResponse({ tokens: result.tokens }));
};

export const logoutHandler = async (req: Request, res: Response) => {
  await authService.logout(req);
  return res.status(httpStatus.OK).json(buildSuccessResponse({ message: 'Logged out successfully' }));
};

export const providerLoginHandler = async (req: Request, res: Response) => {

  try {
    const result = await authService.providerLogin(req.body, req);
    return res.status(httpStatus.OK).json(buildSuccessResponse(result));
  } catch (error) {
    console.error('[AuthController] ❌ Provider login error:', error);
    if (error instanceof Error) {
      console.error('[AuthController] ❌ Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

