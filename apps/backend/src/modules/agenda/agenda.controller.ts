import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { agendaService } from './agenda.service';
import { buildSuccessResponse } from '@/helpers/http-response';

/**
 * Create a new agenda item
 */
export const createAgendaItemHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const agendaItem = await agendaService.create(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(agendaItem, 'Agenda item created successfully'));
};

/**
 * Get agenda item by ID
 */
export const getAgendaItemHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const agendaItem = await agendaService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(agendaItem));
};

/**
 * Get agenda items by event ID
 */
export const getAgendaItemsByEventHandler = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const agendaItems = await agendaService.findByEventId(eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(agendaItems));
};

/**
 * Update agenda item by ID
 */
export const updateAgendaItemHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const agendaItem = await agendaService.updateById(id, req.body, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(agendaItem, 'Agenda item updated successfully'));
};

/**
 * Delete agenda item by ID
 */
export const deleteAgendaItemHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  await agendaService.deleteById(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Agenda item deleted successfully'));
};

