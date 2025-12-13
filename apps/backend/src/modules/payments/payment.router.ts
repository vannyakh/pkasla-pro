import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { authenticate } from '@/common/middlewares/authenticate';
import { webhookRateLimiter } from '@/common/middlewares/rate-limit';
import { 
  createSubscriptionPaymentIntentHandler, 
  createTemplatePaymentIntentHandler,
  createBakongSubscriptionPaymentHandler,
  createBakongTemplatePaymentHandler,
  getBakongTransactionStatusHandler,
} from './payment.controller';
import { stripeWebhookHandler, bakongWebhookHandler } from './webhook.controller';
import express from 'express';

const router = Router();

// Webhook endpoints (must be before body parsing middleware)
router.post(
  '/webhook/stripe',
  webhookRateLimiter,
  express.raw({ type: 'application/json' }),
  asyncHandler(stripeWebhookHandler),
);

router.post(
  '/webhook/bakong',
  webhookRateLimiter,
  express.json(),
  asyncHandler(bakongWebhookHandler),
);

// Stripe payment intent endpoints (require authentication)
router.post(
  '/subscription/intent',
  authenticate,
  asyncHandler(createSubscriptionPaymentIntentHandler),
);

router.post(
  '/template/intent',
  authenticate,
  asyncHandler(createTemplatePaymentIntentHandler),
);

// Bakong KHQR payment endpoints (require authentication)
router.post(
  '/bakong/subscription',
  authenticate,
  asyncHandler(createBakongSubscriptionPaymentHandler),
);

router.post(
  '/bakong/template',
  authenticate,
  asyncHandler(createBakongTemplatePaymentHandler),
);

router.get(
  '/bakong/transaction/:transactionId/status',
  authenticate,
  asyncHandler(getBakongTransactionStatusHandler),
);

export const paymentRouter: Router = router;

