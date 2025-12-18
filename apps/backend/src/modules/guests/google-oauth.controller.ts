import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { googleOAuthService } from './google-oauth.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { AppError } from '@/common/errors/app-error';

/**
 * Get Google OAuth authorization URL
 */
export const getGoogleAuthUrlHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const authUrl = googleOAuthService.generateAuthUrl(req.user.id);

  return res.status(httpStatus.OK).json(
    buildSuccessResponse(
      { authUrl },
      'Authorization URL generated successfully'
    )
  );
};

/**
 * Handle Google OAuth callback
 */
export const googleOAuthCallbackHandler = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || typeof code !== 'string') {
    throw new AppError('Authorization code is required', httpStatus.BAD_REQUEST);
  }

  if (!state || typeof state !== 'string') {
    throw new AppError('Invalid state parameter', httpStatus.BAD_REQUEST);
  }

  const userId = state;

  // Exchange code for tokens
  const tokens = await googleOAuthService.getTokensFromCode(code);

  // Save tokens to user
  await googleOAuthService.saveUserTokens(userId, tokens);

  // Get user info from Google
  const userInfo = await googleOAuthService.getUserInfo(userId);

  return res.status(httpStatus.OK).json(
    buildSuccessResponse(
      {
        connected: true,
        googleEmail: userInfo?.email,
        googleName: userInfo?.name,
      },
      'Google account connected successfully!'
    )
  );
};

/**
 * Get Google OAuth connection status
 */
export const getGoogleConnectionStatusHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const isConnected = await googleOAuthService.isConnected(req.user.id);

  let userInfo = null;
  if (isConnected) {
    userInfo = await googleOAuthService.getUserInfo(req.user.id);
  }

  return res.status(httpStatus.OK).json(
    buildSuccessResponse({
      connected: isConnected,
      googleEmail: userInfo?.email,
      googleName: userInfo?.name,
    })
  );
};

/**
 * Disconnect Google account
 */
export const disconnectGoogleAccountHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  await googleOAuthService.disconnect(req.user.id);

  return res.status(httpStatus.OK).json(
    buildSuccessResponse(
      { connected: false },
      'Google account disconnected successfully'
    )
  );
};

