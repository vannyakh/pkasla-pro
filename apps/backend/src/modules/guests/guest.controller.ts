import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { guestService } from './guest.service';
import { eventService } from '@/modules/events/event.service';
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
  const guests = await guestService.findByUserId(req.user.id, eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(guests));
};

/**
 * Create guests from CSV upload
 */
export const createGuestsFromCSVHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { guests: guestsData, eventId } = req.body;

  if (!Array.isArray(guestsData) || !eventId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Invalid request. Expected guests array and eventId',
    });
  }

  // Transform CSV data to CreateGuestInput format
  const payloads = guestsData.map((guest: any) => ({
    name: guest.name || '',
    email: guest.email,
    phone: guest.phone,
    eventId,
    occupation: guest.occupation,
    address: guest.address,
    province: guest.province,
    tag: guest.tag,
    notes: guest.notes,
    meta: guest.custom1 || guest.custom2 ? {
      ...(guest.custom1 && { custom1: guest.custom1 }),
      ...(guest.custom2 && { custom2: guest.custom2 }),
    } : undefined,
  }));

  const createdGuests = await guestService.createBulk(payloads, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(createdGuests, 'Guests created successfully'));
};

/**
 * Regenerate invite token for a guest
 */
export const regenerateTokenHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const newToken = await guestService.regenerateToken(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse({ token: newToken }, 'Token regenerated successfully'));
};

/**
 * Join event by scanning QR code (public endpoint)
 */
export const joinEventByQRHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { name, email, phone } = req.body;

  // Find event by QR token
  const event = await eventService.findByQRCodeToken(token);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ error: 'Event not found or invalid QR code' });
  }

  // Validate required fields
  if (!name || name.trim().length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: 'Name is required' });
  }

  // Create guest for this event (public, no hostId required)
  const guest = await guestService.create(
    {
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      eventId: event.id,
      status: 'confirmed', // Auto-confirm when joining via QR
    },
    undefined // No hostId for public QR join
  );

  return res.status(httpStatus.CREATED).json(buildSuccessResponse(guest, 'Successfully joined the event!'));
};

