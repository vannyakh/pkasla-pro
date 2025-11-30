import httpStatus from 'http-status';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { AppError } from '@/common/errors/app-error';
import { guestRepository } from './guest.repository';
import { eventService } from '@/modules/events/event.service';
import type { GuestDocument, GuestStatus } from './guest.model';

export interface CreateGuestInput {
  name: string;
  email?: string;
  phone?: string;
  eventId: string;
  userId?: string;
  occupation?: string;
  notes?: string;
  tag?: string;
  address?: string;
  province?: string;
  photo?: string;
  hasGivenGift?: boolean;
  status?: GuestStatus;
}

export interface UpdateGuestInput {
  name?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  notes?: string;
  tag?: string;
  address?: string;
  province?: string;
  photo?: string;
  hasGivenGift?: boolean;
  status?: GuestStatus;
}

export interface GuestResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  eventId: string | { id: string; title: string; date: Date; venue: string; hostId: string | object };
  userId?: string | { id: string; name: string; email: string; avatar?: string };
  createdBy?: string | { id: string; name: string; email: string; avatar?: string };
  status: GuestStatus;
  occupation?: string;
  notes?: string;
  tag?: string;
  address?: string;
  province?: string;
  photo?: string;
  hasGivenGift: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestListFilters {
  eventId?: string;
  userId?: string;
  status?: GuestStatus;
  search?: string;
}

type GuestSource = GuestDocument | (Record<string, any> & { _id?: unknown }) | null;

/**
 * Sanitize guest document to response format
 */
export const sanitizeGuest = (guest: GuestSource): GuestResponse | null => {
  if (!guest) {
    return null;
  }
  const guestObj =
    typeof (guest as GuestDocument).toObject === 'function'
      ? (guest as GuestDocument).toObject()
      : guest;
  const { _id, __v, ...rest } = guestObj as Record<string, any>;
  
  // Handle populated eventId
  let eventId: string | { id: string; title: string; date: Date; venue: string; hostId: string | object };
  if (rest.eventId && typeof rest.eventId === 'object' && rest.eventId._id) {
    eventId = {
      id: rest.eventId._id.toString(),
      title: rest.eventId.title,
      date: rest.eventId.date,
      venue: rest.eventId.venue,
      hostId: rest.eventId.hostId,
    };
  } else {
    eventId = (rest.eventId || _id).toString();
  }

  // Handle populated userId
  let userId: string | { id: string; name: string; email: string; avatar?: string } | undefined;
  if (rest.userId && typeof rest.userId === 'object' && rest.userId._id) {
    userId = {
      id: rest.userId._id.toString(),
      name: rest.userId.name,
      email: rest.userId.email,
      avatar: rest.userId.avatar,
    };
  } else if (rest.userId) {
    userId = rest.userId.toString();
  }

  // Handle populated createdBy
  let createdBy: string | { id: string; name: string; email: string; avatar?: string } | undefined;
  if (rest.createdBy && typeof rest.createdBy === 'object' && rest.createdBy._id) {
    createdBy = {
      id: rest.createdBy._id.toString(),
      name: rest.createdBy.name,
      email: rest.createdBy.email,
      avatar: rest.createdBy.avatar,
    };
  } else if (rest.createdBy) {
    createdBy = rest.createdBy.toString();
  }

  return {
    ...(rest as Omit<GuestResponse, 'id' | 'eventId' | 'userId' | 'createdBy'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
    eventId,
    userId,
    createdBy,
    hasGivenGift: rest.hasGivenGift ?? false,
  } as GuestResponse;
};

class GuestService {
  /**
   * Create a new guest
   */
  async create(payload: CreateGuestInput, hostId?: string): Promise<GuestResponse> {
    // Verify event exists
    const event = await eventService.findById(payload.eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Check if host is trying to add guest to their own event
    if (hostId) {
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only add guests to your own events', httpStatus.FORBIDDEN);
      }
    }

    // Check for duplicate name if restrictDuplicateNames is enabled
    const eventData = await eventService.findById(payload.eventId);
    if (eventData) {
      // This would need to be checked in the event model
      // For now, we'll allow it but could add validation later
    }

    // Check for duplicate email or phone in the same event
    if (payload.email) {
      const existingByEmail = await guestRepository.findByEventIdAndEmail(payload.eventId, payload.email);
      if (existingByEmail) {
        throw new AppError('Guest with this email already exists for this event', httpStatus.CONFLICT);
      }
    }

    if (payload.phone) {
      const existingByPhone = await guestRepository.findByEventIdAndPhone(payload.eventId, payload.phone);
      if (existingByPhone) {
        throw new AppError('Guest with this phone number already exists for this event', httpStatus.CONFLICT);
      }
    }

    // Convert string IDs to ObjectId for repository
    const { userId, eventId, ...rest } = payload;
    const createPayload: Partial<GuestDocument> = {
      ...rest,
      eventId: new Types.ObjectId(eventId),
    };
    if (userId) {
      createPayload.userId = new Types.ObjectId(userId);
    }
    // Store who created this guest
    if (hostId) {
      createPayload.createdBy = new Types.ObjectId(hostId);
    }
    // Generate invite token (32 bytes base64 encoded)
    createPayload.inviteToken = crypto.randomBytes(32).toString('base64url');
    const guest = await guestRepository.create(createPayload);
    
    // Increment guest count
    await eventService.incrementGuestCount(payload.eventId, 1);
    
    const safeGuest = sanitizeGuest(guest);
    if (!safeGuest) {
      throw new AppError('Unable to create guest', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeGuest;
  }

  /**
   * Find guest by ID
   */
  async findById(id: string): Promise<GuestResponse | null> {
    const guest = await guestRepository.findById(id);
    return sanitizeGuest(guest as unknown as GuestDocument);
  }

  /**
   * Find guest by ID or throw error if not found
   */
  async findByIdOrFail(id: string): Promise<GuestResponse> {
    const guest = await this.findById(id);
    if (!guest) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }
    return guest;
  }

  /**
   * Find guests by event ID
   */
  async findByEventId(eventId: string): Promise<GuestResponse[]> {
    const guests = await guestRepository.findByEventId(eventId);
    return guests
      .map((guest) => sanitizeGuest(guest as unknown as GuestDocument))
      .filter(Boolean) as GuestResponse[];
  }

  /**
   * Find guests by user ID
   */
  async findByUserId(userId: string, eventId?: string): Promise<GuestResponse[]> {
    const guests = await guestRepository.findByUserId(userId, eventId);
    return guests
      .map((guest) => sanitizeGuest(guest as unknown as GuestDocument))
      .filter(Boolean) as GuestResponse[];
  }

  /**
   * Update guest by ID
   */
  async updateById(id: string, payload: UpdateGuestInput, hostId?: string): Promise<GuestResponse> {
    // Check if guest exists
    const existing = await guestRepository.findById(id);
    if (!existing) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host of the event
    if (hostId) {
      const guestData = sanitizeGuest(existing as unknown as GuestDocument);
      if (!guestData) {
        throw new AppError('Guest not found', httpStatus.NOT_FOUND);
      }
      const eventId = typeof guestData.eventId === 'string' 
        ? guestData.eventId 
        : guestData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only update guests for your own events', httpStatus.FORBIDDEN);
      }
    }

    // Check for duplicate email or phone if being updated
    if (payload.email) {
      const guestData = sanitizeGuest(existing as unknown as GuestDocument);
      if (guestData) {
        const eventId = typeof guestData.eventId === 'string' 
          ? guestData.eventId 
          : guestData.eventId.id;
        const existingByEmail = await guestRepository.findByEventIdAndEmail(eventId, payload.email);
        if (existingByEmail && existingByEmail._id?.toString() !== id) {
          throw new AppError('Guest with this email already exists for this event', httpStatus.CONFLICT);
        }
      }
    }

    if (payload.phone) {
      const guestData = sanitizeGuest(existing as unknown as GuestDocument);
      if (guestData) {
        const eventId = typeof guestData.eventId === 'string' 
          ? guestData.eventId 
          : guestData.eventId.id;
        const existingByPhone = await guestRepository.findByEventIdAndPhone(eventId, payload.phone);
        if (existingByPhone && existingByPhone._id?.toString() !== id) {
          throw new AppError('Guest with this phone number already exists for this event', httpStatus.CONFLICT);
        }
      }
    }

    const updated = await guestRepository.updateById(id, { $set: payload });
    if (!updated) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }

    const safeGuest = sanitizeGuest(updated as unknown as GuestDocument);
    if (!safeGuest) {
      throw new AppError('Unable to update guest', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeGuest;
  }

  /**
   * Delete guest by ID
   */
  async deleteById(id: string, hostId?: string): Promise<void> {
    const guest = await guestRepository.findById(id);
    if (!guest) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host of the event
    if (hostId) {
      const guestData = sanitizeGuest(guest as unknown as GuestDocument);
      if (!guestData) {
        throw new AppError('Guest not found', httpStatus.NOT_FOUND);
      }
      const eventId = typeof guestData.eventId === 'string' 
        ? guestData.eventId 
        : guestData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only delete guests from your own events', httpStatus.FORBIDDEN);
      }
    }

    const guestData = sanitizeGuest(guest as unknown as GuestDocument);
    if (guestData) {
      const eventId = typeof guestData.eventId === 'string' 
        ? guestData.eventId 
        : guestData.eventId.id;
      await eventService.incrementGuestCount(eventId, -1);
    }

    await guestRepository.deleteById(id);
  }

  /**
   * List guests with pagination and filters
   */
  async list(
    page: number = 1,
    pageSize: number = 10,
    filters?: GuestListFilters
  ): Promise<{
    items: GuestResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const query: Record<string, any> = {};

    // Apply filters
    if (filters?.eventId) {
      query.eventId = filters.eventId;
    }

    if (filters?.userId) {
      query.userId = filters.userId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [guests, total] = await Promise.all([
      guestRepository.listPaginated(query, page, pageSize, { createdAt: -1 }),
      guestRepository.countDocuments(query),
    ]);

    const sanitizedGuests = guests
      .map((guest) => sanitizeGuest(guest as unknown as GuestDocument))
      .filter(Boolean) as GuestResponse[];

    return {
      items: sanitizedGuests,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Create multiple guests from CSV data
   */
  async createBulk(payloads: CreateGuestInput[], hostId?: string): Promise<GuestResponse[]> {
    const results: GuestResponse[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < payloads.length; i++) {
      try {
        const guest = await this.create(payloads[i], hostId);
        results.push(guest);
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error instanceof AppError ? error.message : 'Unknown error',
        });
      }
    }

    // If all failed, throw error
    if (results.length === 0 && errors.length > 0) {
      throw new AppError(
        `Failed to create guests: ${errors.map(e => `Row ${e.row}: ${e.error}`).join('; ')}`,
        httpStatus.BAD_REQUEST
      );
    }

    return results;
  }

  /**
   * Regenerate invite token for a guest
   */
  async regenerateToken(guestId: string, hostId?: string): Promise<string> {
    const guest = await guestRepository.findById(guestId);
    if (!guest) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }

    // Verify host owns the event if hostId provided
    if (hostId) {
      const eventId = typeof guest.eventId === 'string' ? guest.eventId : (guest.eventId as any)?._id?.toString() || (guest.eventId as any)?.id?.toString();
      if (eventId) {
        const event = await eventService.findById(eventId);
        if (event) {
          const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
          if (eventHostId !== hostId) {
            throw new AppError('You can only regenerate tokens for your own event guests', httpStatus.FORBIDDEN);
          }
        }
      }
    }

    // Generate new token
    const newToken = crypto.randomBytes(32).toString('base64url');
    await guestRepository.updateById(guestId, { inviteToken: newToken });
    return newToken;
  }
}

export const guestService = new GuestService();

