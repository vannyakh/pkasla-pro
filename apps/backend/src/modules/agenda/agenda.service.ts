import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '@/common/errors/app-error';
import { agendaRepository } from './agenda.repository';
import { eventService } from '@/modules/events/event.service';
import type { AgendaItemDocument } from './agenda.model';

export interface CreateAgendaItemInput {
  eventId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
}

export interface UpdateAgendaItemInput {
  date?: string;
  time?: string;
  description?: string;
}

export interface AgendaItemResponse {
  id: string;
  eventId: string | { id: string; title: string; date: Date; venue: string; hostId: string | object };
  date: string;
  time: string;
  description?: string;
  createdBy?: string | { id: string; name: string; email: string; avatar?: string };
  createdAt: Date;
  updatedAt: Date;
}

type AgendaItemSource = AgendaItemDocument | (Record<string, any> & { _id?: unknown }) | null;

/**
 * Sanitize agenda item document to response format
 */
export const sanitizeAgendaItem = (item: AgendaItemSource): AgendaItemResponse | null => {
  if (!item) {
    return null;
  }
  const itemObj =
    typeof (item as AgendaItemDocument).toObject === 'function'
      ? (item as AgendaItemDocument).toObject()
      : item;
  const { _id, __v, ...rest } = itemObj as Record<string, any>;
  
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
    ...(rest as Omit<AgendaItemResponse, 'id' | 'eventId' | 'createdBy'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
    eventId,
    createdBy,
  } as AgendaItemResponse;
};

class AgendaService {
  /**
   * Create a new agenda item
   */
  async create(payload: CreateAgendaItemInput, hostId?: string): Promise<AgendaItemResponse> {
    // Verify event exists
    const event = await eventService.findById(payload.eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Check if host is trying to add agenda item to their own event
    if (hostId) {
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only add agenda items to your own events', httpStatus.FORBIDDEN);
      }
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      throw new AppError('Date must be in YYYY-MM-DD format', httpStatus.BAD_REQUEST);
    }

    // Validate time format
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(payload.time)) {
      throw new AppError('Time must be in HH:mm format (24-hour)', httpStatus.BAD_REQUEST);
    }

    // Convert string IDs to ObjectId for repository
    const { eventId, ...rest } = payload;
    const createPayload: Partial<AgendaItemDocument> = {
      ...rest,
      eventId: new Types.ObjectId(eventId),
    };
    
    // Store who created this agenda item
    if (hostId) {
      createPayload.createdBy = new Types.ObjectId(hostId);
    }

    const agendaItem = await agendaRepository.create(createPayload);
    
    const safeItem = sanitizeAgendaItem(agendaItem);
    if (!safeItem) {
      throw new AppError('Unable to create agenda item', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeItem;
  }

  /**
   * Find agenda item by ID
   */
  async findById(id: string): Promise<AgendaItemResponse | null> {
    const item = await agendaRepository.findById(id);
    return sanitizeAgendaItem(item as unknown as AgendaItemDocument);
  }

  /**
   * Find agenda item by ID or throw error if not found
   */
  async findByIdOrFail(id: string): Promise<AgendaItemResponse> {
    const item = await this.findById(id);
    if (!item) {
      throw new AppError('Agenda item not found', httpStatus.NOT_FOUND);
    }
    return item;
  }

  /**
   * Find agenda items by event ID
   */
  async findByEventId(eventId: string): Promise<AgendaItemResponse[]> {
    const items = await agendaRepository.findByEventId(eventId);
    return items
      .map((item) => sanitizeAgendaItem(item as unknown as AgendaItemDocument))
      .filter(Boolean) as AgendaItemResponse[];
  }

  /**
   * Update agenda item by ID
   */
  async updateById(id: string, payload: UpdateAgendaItemInput, hostId?: string): Promise<AgendaItemResponse> {
    // Check if agenda item exists
    const existing = await agendaRepository.findById(id);
    if (!existing) {
      throw new AppError('Agenda item not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host of the event
    if (hostId) {
      const itemData = sanitizeAgendaItem(existing as unknown as AgendaItemDocument);
      if (!itemData) {
        throw new AppError('Agenda item not found', httpStatus.NOT_FOUND);
      }
      const eventId = typeof itemData.eventId === 'string' 
        ? itemData.eventId 
        : itemData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only update agenda items for your own events', httpStatus.FORBIDDEN);
      }
    }

    // Validate date format if provided
    if (payload.date && !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      throw new AppError('Date must be in YYYY-MM-DD format', httpStatus.BAD_REQUEST);
    }

    // Validate time format if provided
    if (payload.time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(payload.time)) {
      throw new AppError('Time must be in HH:mm format (24-hour)', httpStatus.BAD_REQUEST);
    }

    const updated = await agendaRepository.updateById(id, payload);
    if (!updated) {
      throw new AppError('Agenda item not found', httpStatus.NOT_FOUND);
    }

    const safeItem = sanitizeAgendaItem(updated as unknown as AgendaItemDocument);
    if (!safeItem) {
      throw new AppError('Unable to update agenda item', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeItem;
  }

  /**
   * Delete agenda item by ID
   */
  async deleteById(id: string, hostId?: string): Promise<void> {
    const item = await agendaRepository.findById(id);
    if (!item) {
      throw new AppError('Agenda item not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host of the event
    if (hostId) {
      const itemData = sanitizeAgendaItem(item as unknown as AgendaItemDocument);
      if (!itemData) {
        throw new AppError('Agenda item not found', httpStatus.NOT_FOUND);
      }
      const eventId = typeof itemData.eventId === 'string' 
        ? itemData.eventId 
        : itemData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      if (eventHostId !== hostId) {
        throw new AppError('You can only delete agenda items from your own events', httpStatus.FORBIDDEN);
      }
    }

    await agendaRepository.deleteById(id);
  }
}

export const agendaService = new AgendaService();

