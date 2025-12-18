import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '@/common/errors/app-error';
import { giftRepository } from './gift.repository';
import { guestService } from './guest.service';
import { eventService } from '@/modules/events/event.service';
import { notificationHelper } from '@/modules/settings/notification.helper';
import type { GiftDocument, PaymentMethod, Currency } from './gift.model';

export interface CreateGiftInput {
  guestId: string;
  paymentMethod: PaymentMethod;
  currency: Currency;
  amount: number;
  note?: string;
  receiptImage?: string;
}

export interface UpdateGiftInput {
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  amount?: number;
  note?: string;
  receiptImage?: string;
}

export interface GiftResponse {
  id: string;
  guestId: string | { id: string; name: string; email?: string; phone?: string };
  eventId: string | { id: string; title: string; date: Date; venue: string };
  paymentMethod: PaymentMethod;
  currency: Currency;
  amount: number;
  note?: string;
  receiptImage?: string;
  createdBy?: string | { id: string; name: string; email: string; avatar?: string };
  createdAt: Date;
  updatedAt: Date;
}

type GiftSource = GiftDocument | (Record<string, any> & { _id?: unknown }) | null;

/**
 * Sanitize gift document to response format
 */
export const sanitizeGift = (gift: GiftSource): GiftResponse | null => {
  if (!gift) {
    return null;
  }
  const giftObj =
    typeof (gift as GiftDocument).toObject === 'function'
      ? (gift as GiftDocument).toObject()
      : gift;
  const { _id, __v, ...rest } = giftObj as Record<string, any>;

  // Handle populated guestId
  let guestId: string | { id: string; name: string; email?: string; phone?: string };
  if (rest.guestId && typeof rest.guestId === 'object' && rest.guestId._id) {
    guestId = {
      id: rest.guestId._id.toString(),
      name: rest.guestId.name,
      email: rest.guestId.email,
      phone: rest.guestId.phone,
    };
  } else {
    guestId = (rest.guestId || _id).toString();
  }

  // Handle populated eventId
  let eventId: string | { id: string; title: string; date: Date; venue: string };
  if (rest.eventId && typeof rest.eventId === 'object' && rest.eventId._id) {
    eventId = {
      id: rest.eventId._id.toString(),
      title: rest.eventId.title,
      date: rest.eventId.date,
      venue: rest.eventId.venue,
    };
  } else {
    eventId = (rest.eventId || _id).toString();
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
    ...(rest as Omit<GiftResponse, 'id' | 'guestId' | 'eventId' | 'createdBy'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
    guestId,
    eventId,
    createdBy,
  } as GiftResponse;
};

class GiftService {
  /**
   * Create a new gift payment
   */
  async create(payload: CreateGiftInput, userId?: string): Promise<GiftResponse> {
    // Verify guest exists
    const guest = await guestService.findById(payload.guestId);
    if (!guest) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }

    // Get event ID from guest
    const eventId = typeof guest.eventId === 'string' ? guest.eventId : guest.eventId.id;

    // Verify event exists
    const event = await eventService.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host of the event
    if (userId) {
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== userId) {
        throw new AppError('You can only record gifts for your own events', httpStatus.FORBIDDEN);
      }
    }

    // Convert string IDs to ObjectId for repository
    const createPayload: Partial<GiftDocument> = {
      guestId: new Types.ObjectId(payload.guestId),
      eventId: new Types.ObjectId(eventId),
      paymentMethod: payload.paymentMethod,
      currency: payload.currency,
      amount: payload.amount,
      note: payload.note,
      receiptImage: payload.receiptImage,
    };

    if (userId) {
      createPayload.createdBy = new Types.ObjectId(userId);
    }

    const gift = await giftRepository.create(createPayload);

    // Update guest's hasGivenGift flag
    await guestService.updateById(payload.guestId, { hasGivenGift: true }, userId);

    const safeGift = sanitizeGift(gift);
    if (!safeGift) {
      throw new AppError('Unable to create gift', httpStatus.INTERNAL_SERVER_ERROR);
    }

    // Send Telegram notification if user has connected Telegram
    if (userId) {
      const guestName = guest.name;
      const eventTitle = event.title || 'Unknown Event';
      
      await notificationHelper.notifyUserGiftAdded(
        userId,
        guestName,
        eventTitle,
        payload.amount,
        payload.currency,
        payload.paymentMethod
      );
    }

    return safeGift;
  }

  /**
   * Find gift by ID
   */
  async findById(id: string): Promise<GiftResponse | null> {
    const gift = await giftRepository.findById(id);
    return sanitizeGift(gift as unknown as GiftDocument);
  }

  /**
   * Find gift by ID or throw error if not found
   */
  async findByIdOrFail(id: string): Promise<GiftResponse> {
    const gift = await this.findById(id);
    if (!gift) {
      throw new AppError('Gift not found', httpStatus.NOT_FOUND);
    }
    return gift;
  }

  /**
   * Find gifts by guest ID
   */
  async findByGuestId(guestId: string): Promise<GiftResponse[]> {
    const gifts = await giftRepository.findByGuestId(guestId);
    return gifts
      .map((gift) => sanitizeGift(gift as unknown as GiftDocument))
      .filter(Boolean) as GiftResponse[];
  }

  /**
   * Find gifts by event ID
   */
  async findByEventId(eventId: string): Promise<GiftResponse[]> {
    const gifts = await giftRepository.findByEventId(eventId);
    return gifts
      .map((gift) => sanitizeGift(gift as unknown as GiftDocument))
      .filter(Boolean) as GiftResponse[];
  }

  /**
   * Update gift by ID
   */
  async updateById(id: string, payload: UpdateGiftInput, userId?: string): Promise<GiftResponse> {
    // Check if gift exists
    const existing = await giftRepository.findById(id);
    if (!existing) {
      throw new AppError('Gift not found', httpStatus.NOT_FOUND);
    }

    // Check if user is authorized (host of the event)
    if (userId) {
      const giftData = sanitizeGift(existing as unknown as GiftDocument);
      if (!giftData) {
        throw new AppError('Gift not found', httpStatus.NOT_FOUND);
      }
      const eventId = typeof giftData.eventId === 'string' ? giftData.eventId : giftData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== userId) {
        throw new AppError('You can only update gifts for your own events', httpStatus.FORBIDDEN);
      }
    }

    const updated = await giftRepository.updateById(id, { $set: payload });
    if (!updated) {
      throw new AppError('Gift not found', httpStatus.NOT_FOUND);
    }

    const safeGift = sanitizeGift(updated as unknown as GiftDocument);
    if (!safeGift) {
      throw new AppError('Unable to update gift', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeGift;
  }

  /**
   * Delete gift by ID
   */
  async deleteById(id: string, userId?: string): Promise<void> {
    const gift = await giftRepository.findById(id);
    if (!gift) {
      throw new AppError('Gift not found', httpStatus.NOT_FOUND);
    }

    // Check if user is authorized (host of the event)
    if (userId) {
      const giftData = sanitizeGift(gift as unknown as GiftDocument);
      if (!giftData) {
        throw new AppError('Gift not found', httpStatus.NOT_FOUND);
      }
      const eventId = typeof giftData.eventId === 'string' ? giftData.eventId : giftData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== userId) {
        throw new AppError('You can only delete gifts from your own events', httpStatus.FORBIDDEN);
      }
    }

    // Get guest ID before deleting
    const giftData = sanitizeGift(gift as unknown as GiftDocument);
    if (giftData) {
      const guestId = typeof giftData.guestId === 'string' ? giftData.guestId : giftData.guestId.id;
      
      await giftRepository.deleteById(id);

      // Check if guest has any other gifts
      const remainingGifts = await giftRepository.countByGuestId(guestId);
      if (remainingGifts === 0) {
        // Update guest's hasGivenGift flag to false
        await guestService.updateById(guestId, { hasGivenGift: false }, userId);
      }
    } else {
      await giftRepository.deleteById(id);
    }
  }

  /**
   * List gifts with pagination and filters
   */
  async list(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      guestId?: string;
      eventId?: string;
      paymentMethod?: PaymentMethod;
      currency?: Currency;
    }
  ): Promise<{
    items: GiftResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const query: Record<string, any> = {};

    if (filters?.guestId) {
      query.guestId = filters.guestId;
    }

    if (filters?.eventId) {
      query.eventId = filters.eventId;
    }

    if (filters?.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters?.currency) {
      query.currency = filters.currency;
    }

    const [gifts, total] = await Promise.all([
      giftRepository.list(query),
      giftRepository.countDocuments(query),
    ]);

    const sanitizedGifts = gifts
      .map((gift) => sanitizeGift(gift as unknown as GiftDocument))
      .filter(Boolean) as GiftResponse[];

    // Simple pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedGifts = sanitizedGifts.slice(startIndex, endIndex);

    return {
      items: paginatedGifts,
      total,
      page,
      pageSize,
    };
  }
}

export const giftService = new GiftService();

