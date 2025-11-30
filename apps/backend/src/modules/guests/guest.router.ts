import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import {
  createGuestHandler,
  getGuestHandler,
  updateGuestHandler,
  deleteGuestHandler,
  listGuestsHandler,
  getGuestsByEventHandler,
  getMyGuestsHandler,
  createGuestsFromCSVHandler,
  regenerateTokenHandler,
} from './guest.controller';
import {
  createGuestSchema,
  updateGuestSchema,
  getGuestSchema,
  deleteGuestSchema,
  listGuestsQuerySchema,
} from './guest.validation';
import { giftRouter } from './gift.router';

const router = Router();

// List guests with pagination and filters
router.get(
  '/',
  validateRequest(listGuestsQuerySchema),
  asyncHandler(listGuestsHandler),
);

// Get guests by current user (authenticated)
router.get(
  '/my',
  authenticate,
  asyncHandler(getMyGuestsHandler),
);

// Get guests by event ID
router.get(
  '/event/:eventId',
  asyncHandler(getGuestsByEventHandler),
);

// Get guest by ID
router.get(
  '/:id',
  validateRequest(getGuestSchema),
  asyncHandler(getGuestHandler),
);

// Create new guest (authenticated, host only)
router.post(
  '/',
  authenticate,
  validateRequest(createGuestSchema),
  asyncHandler(createGuestHandler),
);

// Create guests from CSV (authenticated, host only)
router.post(
  '/bulk',
  authenticate,
  asyncHandler(createGuestsFromCSVHandler),
);

// Regenerate invite token (authenticated, host only)
router.post(
  '/:id/regenerate-token',
  authenticate,
  asyncHandler(regenerateTokenHandler),
);

// Update guest by ID (authenticated, host only)
router.patch(
  '/:id',
  authenticate,
  validateRequest(updateGuestSchema),
  asyncHandler(updateGuestHandler),
);

// Delete guest by ID (authenticated, host only)
router.delete(
  '/:id',
  authenticate,
  validateRequest(deleteGuestSchema),
  asyncHandler(deleteGuestHandler),
);

// Gift payment routes (nested under guests)
router.use('/gifts', giftRouter);

export const guestRouter: Router = router;

