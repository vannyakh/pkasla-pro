import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '@/common/errors/app-error';
import { invitationRepository } from './invitation.repository';
import { eventService } from '@/modules/events/event.service';
import { guestService } from '@/modules/guests/guest.service';
import { userService } from '@/modules/users/user.service';
import type { InvitationDocument, InvitationStatus } from './invitation.model';

export interface CreateInvitationInput {
  eventId: string;
  userId: string;
  message?: string;
}

export interface UpdateInvitationInput {
  status: InvitationStatus;
  message?: string;
}

export interface InvitationResponse {
  id: string;
  eventId: string | { id: string; title: string; date: Date; venue: string; hostId: string | object };
  userId: string | { id: string; name: string; email: string; avatar?: string };
  message?: string;
  status: InvitationStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationListFilters {
  eventId?: string;
  userId?: string;
  status?: InvitationStatus;
}

type InvitationSource = InvitationDocument | (Record<string, any> & { _id?: unknown }) | null;

/**
 * Sanitize invitation document to response format
 */
export const sanitizeInvitation = (invitation: InvitationSource): InvitationResponse | null => {
  if (!invitation) {
    return null;
  }
  const invitationObj =
    typeof (invitation as InvitationDocument).toObject === 'function'
      ? (invitation as InvitationDocument).toObject()
      : invitation;
  const { _id, __v, ...rest } = invitationObj as Record<string, any>;
  
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
  let userId: string | { id: string; name: string; email: string; avatar?: string };
  if (rest.userId && typeof rest.userId === 'object' && rest.userId._id) {
    userId = {
      id: rest.userId._id.toString(),
      name: rest.userId.name,
      email: rest.userId.email,
      avatar: rest.userId.avatar,
    };
  } else {
    userId = (rest.userId || _id).toString();
  }

  return {
    ...(rest as Omit<InvitationResponse, 'id' | 'eventId' | 'userId'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
    eventId,
    userId,
  } as InvitationResponse;
};

class InvitationService {
  /**
   * Create a new invitation request
   */
  async create(payload: CreateInvitationInput): Promise<InvitationResponse> {
    // Verify event exists
    const event = await eventService.findById(payload.eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Verify user exists
    const user = await userService.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Check if invitation already exists
    const existing = await invitationRepository.findByEventIdAndUserId(payload.eventId, payload.userId);
    if (existing) {
      throw new AppError('Invitation request already exists for this event', httpStatus.CONFLICT);
    }

    const invitation = await invitationRepository.create({
      eventId: new Types.ObjectId(payload.eventId),
      userId: new Types.ObjectId(payload.userId),
      message: payload.message,
      status: 'pending',
    });
    
    const safeInvitation = sanitizeInvitation(invitation);
    if (!safeInvitation) {
      throw new AppError('Unable to create invitation request', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeInvitation;
  }

  /**
   * Find invitation by ID
   */
  async findById(id: string): Promise<InvitationResponse | null> {
    const invitation = await invitationRepository.findById(id);
    return sanitizeInvitation(invitation as unknown as InvitationDocument);
  }

  /**
   * Find invitation by ID or throw error if not found
   */
  async findByIdOrFail(id: string): Promise<InvitationResponse> {
    const invitation = await this.findById(id);
    if (!invitation) {
      throw new AppError('Invitation not found', httpStatus.NOT_FOUND);
    }
    return invitation;
  }

  /**
   * Find invitations by event ID
   */
  async findByEventId(eventId: string): Promise<InvitationResponse[]> {
    const invitations = await invitationRepository.findByEventId(eventId);
    return invitations
      .map((invitation) => sanitizeInvitation(invitation as unknown as InvitationDocument))
      .filter(Boolean) as InvitationResponse[];
  }

  /**
   * Find invitations by user ID
   */
  async findByUserId(userId: string, eventId?: string): Promise<InvitationResponse[]> {
    const invitations = await invitationRepository.findByUserId(userId, eventId);
    return invitations
      .map((invitation) => sanitizeInvitation(invitation as unknown as InvitationDocument))
      .filter(Boolean) as InvitationResponse[];
  }

  /**
   * Update invitation status (approve/decline)
   */
  async updateStatus(
    id: string,
    status: InvitationStatus,
    hostId: string
  ): Promise<InvitationResponse> {
    // Check if invitation exists
    const existing = await invitationRepository.findById(id);
    if (!existing) {
      throw new AppError('Invitation not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the host of the event
    const invitationData = sanitizeInvitation(existing as unknown as InvitationDocument);
    if (!invitationData) {
      throw new AppError('Invitation not found', httpStatus.NOT_FOUND);
    }
    const eventId = typeof invitationData.eventId === 'string' 
      ? invitationData.eventId 
      : invitationData.eventId.id;
    const event = await eventService.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }
    const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
    if (eventHostId !== hostId) {
      throw new AppError('You can only manage invitations for your own events', httpStatus.FORBIDDEN);
    }

    // Only allow status changes from pending
    const existingInvitation = sanitizeInvitation(existing as unknown as InvitationDocument);
    if (existingInvitation && existingInvitation.status !== 'pending') {
      throw new AppError('Invitation has already been responded to', httpStatus.BAD_REQUEST);
    }

    const updateData: any = {
      status,
      respondedAt: new Date(),
    };

    const updated = await invitationRepository.updateById(id, { $set: updateData });
    if (!updated) {
      throw new AppError('Invitation not found', httpStatus.NOT_FOUND);
    }

    // If approved, create a guest entry
    if (status === 'approved') {
      const updatedInvitation = sanitizeInvitation(updated as unknown as InvitationDocument);
      if (updatedInvitation) {
        const userId = typeof updatedInvitation.userId === 'string' 
          ? updatedInvitation.userId 
          : updatedInvitation.userId.id;
        const user = await userService.findById(userId);
        if (user) {
          try {
            await guestService.create({
              name: user.name,
              email: user.email,
              phone: user.phone,
              eventId,
              userId,
              status: 'confirmed',
            }, hostId);
          } catch (error) {
            // If guest already exists, that's okay
            if (error instanceof AppError && error.statusCode !== httpStatus.CONFLICT) {
              throw error;
            }
          }
        }
      }
    }

    const safeInvitation = sanitizeInvitation(updated as unknown as InvitationDocument);
    if (!safeInvitation) {
      throw new AppError('Unable to update invitation', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeInvitation;
  }

  /**
   * Delete invitation by ID
   */
  async deleteById(id: string, userId?: string): Promise<void> {
    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new AppError('Invitation not found', httpStatus.NOT_FOUND);
    }

    // Check if user is the requester or the host
    if (userId) {
      const invitationData = sanitizeInvitation(invitation as unknown as InvitationDocument);
      if (!invitationData) {
        throw new AppError('Invitation not found', httpStatus.NOT_FOUND);
      }
      const invitationUserId = typeof invitationData.userId === 'string' 
        ? invitationData.userId 
        : invitationData.userId.id;
      const eventId = typeof invitationData.eventId === 'string' 
        ? invitationData.eventId 
        : invitationData.eventId.id;
      const event = await eventService.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', httpStatus.NOT_FOUND);
      }
      const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
      
      if (invitationUserId !== userId && eventHostId !== userId) {
        throw new AppError('You can only delete your own invitation requests or invitations to your events', httpStatus.FORBIDDEN);
      }
    }

    await invitationRepository.deleteById(id);
  }

  /**
   * List invitations with pagination and filters
   */
  async list(
    page: number = 1,
    pageSize: number = 10,
    filters?: InvitationListFilters
  ): Promise<{
    items: InvitationResponse[];
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

    const [invitations, total] = await Promise.all([
      invitationRepository.listPaginated(query, page, pageSize, { createdAt: -1 }),
      invitationRepository.countDocuments(query),
    ]);

    const sanitizedInvitations = invitations
      .map((invitation) => sanitizeInvitation(invitation as unknown as InvitationDocument))
      .filter(Boolean) as InvitationResponse[];

    return {
      items: sanitizedInvitations,
      total,
      page,
      pageSize,
    };
  }
}

export const invitationService = new InvitationService();

