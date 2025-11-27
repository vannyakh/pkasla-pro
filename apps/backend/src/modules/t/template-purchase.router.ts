import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createTemplatePurchaseHandler,
  getMyTemplatePurchasesHandler,
  checkTemplateOwnershipHandler,
  getTemplateRevenueHandler,
} from './template-purchase.controller';
import {
  createTemplatePurchaseSchema,
  checkTemplateOwnershipSchema,
} from './template-purchase.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's template purchases
router.get('/me', asyncHandler(getMyTemplatePurchasesHandler));

// Check if user owns a template
router.get(
  '/check/:templateId',
  validateRequest(checkTemplateOwnershipSchema),
  asyncHandler(checkTemplateOwnershipHandler),
);

// Purchase a template
router.post(
  '/',
  validateRequest(createTemplatePurchaseSchema),
  asyncHandler(createTemplatePurchaseHandler),
);

// Get total revenue (Admin only)
router.get(
  '/revenue',
  authorize('admin'),
  asyncHandler(getTemplateRevenueHandler),
);

export const templatePurchaseRouter: Router = router;

