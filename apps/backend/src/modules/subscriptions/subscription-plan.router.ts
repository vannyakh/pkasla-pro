import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createSubscriptionPlanHandler,
  getSubscriptionPlanHandler,
  updateSubscriptionPlanHandler,
  deleteSubscriptionPlanHandler,
  listSubscriptionPlansHandler,
} from './subscription-plan.controller';
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  getSubscriptionPlanSchema,
  deleteSubscriptionPlanSchema,
} from './subscription-plan.validation';

const router = Router();

// List all subscription plans (public)
router.get('/', asyncHandler(listSubscriptionPlansHandler));

// Get subscription plan by ID (public)
router.get(
  '/:id',
  validateRequest(getSubscriptionPlanSchema),
  asyncHandler(getSubscriptionPlanHandler),
);

// Create subscription plan (Admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createSubscriptionPlanSchema),
  asyncHandler(createSubscriptionPlanHandler),
);

// Update subscription plan (Admin only)
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateSubscriptionPlanSchema),
  asyncHandler(updateSubscriptionPlanHandler),
);

// Delete subscription plan (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(deleteSubscriptionPlanSchema),
  asyncHandler(deleteSubscriptionPlanHandler),
);

export const subscriptionPlanRouter: Router = router;

