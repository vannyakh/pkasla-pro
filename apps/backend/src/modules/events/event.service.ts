import httpStatus from 'http-status';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { AppError } from '@/common/errors/app-error';
import { eventRepository } from './event.repository';
import type { EventDocument, EventStatus, EventType } from './event.model';

export interface CreateEventInput {
  title: string;
  description?: string;
  eventType: EventType;
  date: string | Date;
  venue: string;
  googleMapLink?: string;
  hostId: string;
  coverImage?: string;
  khqrUsd?: string;
  khqrKhr?: string;
  restrictDuplicateNames?: boolean;
  status?: EventStatus;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  eventType?: EventType;
  date?: string | Date;
  venue?: string;
  googleMapLink?: string;
  coverImage?: string;
  khqrUsd?: string;
  khqrKhr?: string;
  restrictDuplicateNames?: boolean;
  status?: EventStatus;
  templateSlug?: string;
  userTemplateConfig?: {
    images?: Record<string, string>;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, number>;
    customVariables?: Record<string, string>;
  };
}

export interface EventResponse {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  date: Date;
  venue: string;
  googleMapLink?: string;
  hostId: string | { id: string; name: string; email: string; avatar?: string };
  coverImage?: string;
  khqrUsd?: string;
  khqrKhr?: string;
  restrictDuplicateNames: boolean;
  status: EventStatus;
  guestCount: number;
  templateSlug?: string;
  userTemplateConfig?: {
    images?: Record<string, string>;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, number>;
    customVariables?: Record<string, string>;
  };
  qrCodeToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventListFilters {
  hostId?: string;
  status?: EventStatus;
  eventType?: EventType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

type EventSource = EventDocument | (Record<string, any> & { _id?: unknown }) | null;

/**
 * Sanitize event document to response format
 */
export const sanitizeEvent = (event: EventSource): EventResponse | null => {
  if (!event) {
    return null;
  }
  const eventObj =
    typeof (event as EventDocument).toObject === 'function'
      ? (event as EventDocument).toObject()
      : event;
  const { _id, __v, ...rest } = eventObj as Record<string, any>;
  
  // Handle populated hostId
  let hostId: string | { id: string; name: string; email: string; avatar?: string };
  if (rest.hostId && typeof rest.hostId === 'object' && rest.hostId._id) {
    hostId = {
      id: rest.hostId._id.toString(),
      name: rest.hostId.name,
      email: rest.hostId.email,
      avatar: rest.hostId.avatar,
    };
  } else {
    hostId = (rest.hostId || _id).toString();
  }

  return {
    ...(rest as Omit<EventResponse, 'id' | 'hostId'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
    hostId,
  } as EventResponse;
};

class EventService {
  /**
   * Create a new event
   */
  async create(payload: CreateEventInput): Promise<EventResponse> {
    const event = await eventRepository.create({
      ...payload,
      date: new Date(payload.date),
      hostId: new Types.ObjectId(payload.hostId),
      restrictDuplicateNames: payload.restrictDuplicateNames ?? false,
      status: payload.status ?? 'draft',
    });
    const safeEvent = sanitizeEvent(event);
    if (!safeEvent) {
      throw new AppError('Unable to create event', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeEvent;
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<EventResponse | null> {
    const event = await eventRepository.findById(id);
    return sanitizeEvent(event as unknown as EventDocument);
  }

  /**
   * Find event by ID or throw error if not found
   */
  async findByIdOrFail(id: string): Promise<EventResponse> {
    const event = await this.findById(id);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }
    return event;
  }

  /**
   * Find events by host ID
   */
  async findByHostId(hostId: string): Promise<EventResponse[]> {
    const events = await eventRepository.findByHostId(hostId);
    return events
      .map((event) => sanitizeEvent(event as unknown as EventDocument))
      .filter(Boolean) as EventResponse[];
  }

  /**
   * Update event by ID
   */
  async updateById(id: string, payload: UpdateEventInput, hostId?: string): Promise<EventResponse> {
    // Check if event exists
    const existing = await eventRepository.findById(id);
    if (!existing) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host
    if (hostId) {
      const existingEvent = sanitizeEvent(existing as unknown as EventDocument);
      if (!existingEvent) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof existingEvent.hostId === 'string' 
        ? existingEvent.hostId 
        : existingEvent.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only update your own events', httpStatus.FORBIDDEN);
      }
    }

    const updateData: any = { ...payload };
    if (payload.date) {
      updateData.date = new Date(payload.date);
    }
    
    // Handle templateSlug: convert empty string to null to clear it
    if (payload.templateSlug !== undefined) {
      updateData.templateSlug = payload.templateSlug === '' ? null : payload.templateSlug;
    }

    const updated = await eventRepository.updateById(id, { $set: updateData });
    if (!updated) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    const safeEvent = sanitizeEvent(updated as unknown as EventDocument);
    if (!safeEvent) {
      throw new AppError('Unable to update event', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeEvent;
  }

  /**
   * Delete event by ID
   */
  async deleteById(id: string, hostId?: string): Promise<void> {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host
    if (hostId) {
      const eventData = sanitizeEvent(event as unknown as EventDocument);
      if (!eventData) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof eventData.hostId === 'string' 
        ? eventData.hostId 
        : eventData.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only delete your own events', httpStatus.FORBIDDEN);
      }
    }

    await eventRepository.deleteById(id);
  }

  /**
   * List events with pagination and filters
   */
  async list(
    page: number = 1,
    pageSize: number = 10,
    filters?: EventListFilters
  ): Promise<{
    items: EventResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const query: Record<string, any> = {};

    // Apply filters
    if (filters?.hostId) {
      query.hostId = filters.hostId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.eventType) {
      query.eventType = filters.eventType;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      query.date = {};
      if (filters.dateFrom) {
        query.date.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.date.$lte = new Date(filters.dateTo);
      }
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { venue: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [events, total] = await Promise.all([
      eventRepository.listPaginated(query, page, pageSize, { createdAt: -1 }),
      eventRepository.countDocuments(query),
    ]);

    const sanitizedEvents = events
      .map((event) => sanitizeEvent(event as unknown as EventDocument))
      .filter(Boolean) as EventResponse[];

    return {
      items: sanitizedEvents,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get events by type with pagination
   */
  async findByEventType(
    eventType: EventType,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    items: EventResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const [events, total] = await Promise.all([
      eventRepository.findByEventTypePaginated(eventType, page, pageSize, { createdAt: -1 }),
      eventRepository.countDocuments({ eventType }),
    ]);

    const sanitizedEvents = events
      .map((event) => sanitizeEvent(event as unknown as EventDocument))
      .filter(Boolean) as EventResponse[];

    return {
      items: sanitizedEvents,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get all unique event types (categories)
   */
  async getEventCategories(): Promise<string[]> {
    // Return all available event types
    return ['wedding', 'engagement', 'hand-cutting', 'birthday', 'anniversary', 'other'];
  }

  /**
   * Increment guest count
   */
  async incrementGuestCount(eventId: string, increment: number = 1): Promise<void> {
    await eventRepository.incrementGuestCount(eventId, increment);
  }

  /**
   * Generate or regenerate QR code token for event
   */
  async generateQRCodeToken(eventId: string, hostId?: string): Promise<string> {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Verify host if provided
    if (hostId) {
      const existingEvent = sanitizeEvent(event as unknown as EventDocument);
      if (!existingEvent) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof existingEvent.hostId === 'string' 
        ? existingEvent.hostId 
        : existingEvent.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only generate QR codes for your own events', httpStatus.FORBIDDEN);
      }
    }

    // Generate new token (32 bytes base64url encoded)
    const token = crypto.randomBytes(32).toString('base64url');

    // Update event with new token
    await eventRepository.updateById(eventId, { qrCodeToken: token });

    return token;
  }

  /**
   * Find event by QR code token
   */
  async findByQRCodeToken(token: string): Promise<EventResponse | null> {
    const event = await eventRepository.findByQRCodeToken(token);
    if (!event) {
      return null;
    }
    return sanitizeEvent(event);
  }
}

export const eventService = new EventService();

