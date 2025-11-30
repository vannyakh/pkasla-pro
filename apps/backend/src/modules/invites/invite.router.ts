import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import {
  getInviteHandler,
  trackOpenHandler,
  trackClickHandler,
  submitRSVPHandler,
  regenerateTokenHandler,
} from './invite.controller';
import {
  getInviteSchema,
  trackOpenSchema,
  trackClickSchema,
  submitRSVPSchema,
  regenerateTokenSchema,
} from './invite.validation';

const router = Router();

// Public routes (no authentication required)
// Get invitation data by token
router.get(
  '/:token',
  validateRequest(getInviteSchema),
  asyncHandler(getInviteHandler),
);

// Track invitation open (1px image)
router.get(
  '/:token/track/open',
  validateRequest(trackOpenSchema),
  asyncHandler(trackOpenHandler),
);

// Track invitation click
router.post(
  '/:token/track/click',
  validateRequest(trackClickSchema),
  asyncHandler(trackClickHandler),
);

// Submit RSVP
router.post(
  '/:token/rsvp',
  validateRequest(submitRSVPSchema),
  asyncHandler(submitRSVPHandler),
);

// Authenticated routes
// Regenerate invite token
router.post(
  '/guest/:guestId/regenerate-token',
  authenticate,
  validateRequest(regenerateTokenSchema),
  asyncHandler(regenerateTokenHandler),
);

export const inviteRouter: Router = router;

