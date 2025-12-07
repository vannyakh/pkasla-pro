import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import {
  createAgendaItemHandler,
  getAgendaItemHandler,
  getAgendaItemsByEventHandler,
  updateAgendaItemHandler,
  deleteAgendaItemHandler,
} from './agenda.controller';
import {
  createAgendaItemSchema,
  updateAgendaItemSchema,
  getAgendaItemSchema,
  deleteAgendaItemSchema,
  getAgendaItemsByEventSchema,
} from './agenda.validation';

const router = Router();

// Get agenda items by event ID (public, but can be restricted if needed)
router.get(
  '/event/:eventId',
  validateRequest(getAgendaItemsByEventSchema),
  asyncHandler(getAgendaItemsByEventHandler),
);

// Get agenda item by ID
router.get(
  '/:id',
  validateRequest(getAgendaItemSchema),
  asyncHandler(getAgendaItemHandler),
);

// Create new agenda item (authenticated, host only)
router.post(
  '/',
  authenticate,
  validateRequest(createAgendaItemSchema),
  asyncHandler(createAgendaItemHandler),
);

// Update agenda item by ID (authenticated, host only)
router.patch(
  '/:id',
  authenticate,
  validateRequest(updateAgendaItemSchema),
  asyncHandler(updateAgendaItemHandler),
);

// Delete agenda item by ID (authenticated, host only)
router.delete(
  '/:id',
  authenticate,
  validateRequest(deleteAgendaItemSchema),
  asyncHandler(deleteAgendaItemHandler),
);

export const agendaRouter: Router = router;

