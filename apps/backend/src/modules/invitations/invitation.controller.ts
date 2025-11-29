import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { invitationService } from './invitation.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import type { InvitationStatus } from './invitation.model';

/**
 * Create a new invitation request
 */
export const createInvitationHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const invitation = await invitationService.create({
    ...req.body,
    userId: req.user.id,
  });
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(invitation, 'Invitation request created successfully'));
};

/**
 * Get invitation by ID
 */
export const getInvitationHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invitation = await invitationService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(invitation));
};

/**
 * Update invitation status (approve/decline)
 */
export const updateInvitationStatusHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const { status } = req.body;
  const invitation = await invitationService.updateStatus(id, status, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(invitation, `Invitation ${status} successfully`));
};

/**
 * Delete invitation by ID
 */
export const deleteInvitationHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  await invitationService.deleteById(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Invitation deleted successfully'));
};

/**
 * List invitations with pagination and filters
 */
export const listInvitationsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  
  const filters: {
    eventId?: string;
    userId?: string;
    status?: InvitationStatus;
  } = {};
  
  if (req.query.eventId) {
    filters.eventId = req.query.eventId as string;
  }
  
  if (req.query.userId) {
    filters.userId = req.query.userId as string;
  }
  
  if (req.query.status) {
    filters.status = req.query.status as InvitationStatus;
  }
  
  const result = await invitationService.list(page, pageSize, filters);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

/**
 * Get invitations by event ID
 */
export const getInvitationsByEventHandler = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const invitations = await invitationService.findByEventId(eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(invitations));
};

/**
 * Get invitations by current user
 */
export const getMyInvitationsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const eventId = req.query.eventId as string | undefined;
  const invitations = await invitationService.findByUserId(req.user.id, eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(invitations));
};

