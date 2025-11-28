import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { guestService } from './guest.service';
import { buildSuccessResponse } from '@/helpers/http-response';

/**
 * Create a new guest
 */
export const createGuestHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const guest = await guestService.create(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(guest, 'Guest created successfully'));
};

/**
 * Get guest by ID
 */
export const getGuestHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const guest = await guestService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(guest));
};

/**
 * Update guest by ID
 */
export const updateGuestHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const guest = await guestService.updateById(id, req.body, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(guest, 'Guest updated successfully'));
};

/**
 * Delete guest by ID
 */
export const deleteGuestHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  await guestService.deleteById(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Guest deleted successfully'));
};

/**
 * List guests with pagination and filters
 */
export const listGuestsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  
  const filters: {
    eventId?: string;
    userId?: string;
    status?: 'pending' | 'confirmed' | 'declined';
    search?: string;
  } = {};
  
  if (req.query.eventId) {
    filters.eventId = req.query.eventId as string;
  }
  
  if (req.query.userId) {
    filters.userId = req.query.userId as string;
  }
  
  if (req.query.status) {
    filters.status = req.query.status as 'pending' | 'confirmed' | 'declined';
  }
  
  if (req.query.search) {
    filters.search = req.query.search as string;
  }
  
  const result = await guestService.list(page, pageSize, filters);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

/**
 * Get guests by event ID
 */
export const getGuestsByEventHandler = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const guests = await guestService.findByEventId(eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(guests));
};

/**
 * Get guests by current user
 */
export const getMyGuestsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const eventId = req.query.eventId as string | undefined;
  console.log("eventId", eventId);
  console.log("req.user.id", req.user.id);
  const guests = await guestService.findByUserId(req.user.id, eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(guests));
};

