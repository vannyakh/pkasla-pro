import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createUserSubscriptionHandler,
  getMySubscriptionsHandler,
  getMyActiveSubscriptionHandler,
  cancelSubscriptionHandler,
  getUserSubscriptionsHandler,
} from './user-subscription.controller';
import {
  createUserSubscriptionSchema,
  cancelSubscriptionSchema,
  getUserSubscriptionsSchema,
} from './user-subscription.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's subscriptions
router.get('/me', asyncHandler(getMySubscriptionsHandler));

// Get current user's active subscription
router.get('/me/active', asyncHandler(getMyActiveSubscriptionHandler));

// Create subscription for current user
router.post(
  '/',
  validateRequest(createUserSubscriptionSchema),
  asyncHandler(createUserSubscriptionHandler),
);

// Cancel subscription
router.post(
  '/:id/cancel',
  validateRequest(cancelSubscriptionSchema),
  asyncHandler(cancelSubscriptionHandler),
);

// Get subscriptions by user ID (Admin only)
router.get(
  '/user/:userId',
  authorize('admin'),
  validateRequest(getUserSubscriptionsSchema),
  asyncHandler(getUserSubscriptionsHandler),
);

export const userSubscriptionRouter: Router = router;

