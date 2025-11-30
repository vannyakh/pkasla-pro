import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { inviteService } from './invite.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import type { GuestStatus } from '@/modules/guests/guest.model';

/**
 * Get invitation data by token (for rendering)
 */
export const getInviteHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  const data = await inviteService.getInviteData(token);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data));
};

/**
 * Track invitation open (1px tracking image)
 */
export const trackOpenHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  await inviteService.trackOpen(token);
  
  // Return 1x1 transparent PNG
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.send(pixel);
};

/**
 * Track invitation click
 */
export const trackClickHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  await inviteService.trackClick(token);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Click tracked'));
};

/**
 * Submit RSVP
 */
export const submitRSVPHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { status, message } = req.body;

  if (!status || !['pending', 'confirmed', 'declined'].includes(status)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Invalid status. Must be one of: pending, confirmed, declined',
    });
  }

  const guest = await inviteService.submitRSVP(token, status as GuestStatus, message);
  return res.status(httpStatus.OK).json(buildSuccessResponse(guest, 'RSVP submitted successfully'));
};

/**
 * Regenerate invite token
 */
export const regenerateTokenHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { guestId } = req.params;
  const newToken = await inviteService.regenerateToken(guestId, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse({ token: newToken }, 'Token regenerated successfully'));
};

