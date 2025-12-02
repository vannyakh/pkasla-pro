import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { stripeService } from './stripe.service';
import { bakongService } from './bakong.service';
import { userSubscriptionService } from '@/modules/subscriptions/user-subscription.service';
import { templatePurchaseService } from '@/modules/t/template-purchase.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { logger } from '@/utils/logger';

/**
 * Handle Stripe webhook events
 */
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  logger.info({
    hasSignature: !!signature,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, 'Stripe webhook received');

  if (!signature) {
    logger.warn({
      ip: req.ip,
    }, 'Stripe webhook missing signature header');
    return res.status(httpStatus.BAD_REQUEST).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  try {
    event = stripeService.verifyWebhookSignature(req.body, signature);
    logger.info({
      eventId: event.id,
      eventType: event.type,
    }, 'Stripe webhook signature verified, processing event');
  } catch (error: any) {
    logger.error({
      error: error.message,
      ip: req.ip,
    }, 'Stripe webhook signature verification failed');
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        logger.info({
          eventId: event.id,
          paymentIntentId: (event.data.object as any).id,
        }, 'Processing payment_intent.succeeded event');
        await handlePaymentIntentSucceeded(event.data.object as any);
        break;

      case 'payment_intent.payment_failed':
        logger.info({
          eventId: event.id,
          paymentIntentId: (event.data.object as any).id,
        }, 'Processing payment_intent.payment_failed event');
        await handlePaymentIntentFailed(event.data.object as any);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        logger.info({
          eventId: event.id,
          subscriptionId: (event.data.object as any).id,
          eventType: event.type,
        }, 'Processing subscription updated event');
        await handleSubscriptionUpdated(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        logger.info({
          eventId: event.id,
          subscriptionId: (event.data.object as any).id,
        }, 'Processing subscription deleted event');
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      default:
        logger.debug({
          eventId: event.id,
          eventType: event.type,
        }, 'Unhandled Stripe webhook event type');
    }

    logger.info({
      eventId: event.id,
      eventType: event.type,
    }, 'Stripe webhook processed successfully');

    return res.status(httpStatus.OK).json(buildSuccessResponse({ received: true }));
  } catch (error: any) {
    logger.error({
      error: error.message,
      eventId: event.id,
      eventType: event.type,
      stack: error.stack,
    }, 'Stripe webhook handler error');
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
};

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const metadata = paymentIntent.metadata;
  const userId = metadata.userId;
  const transactionId = paymentIntent.id;

  logger.info({
    paymentIntentId: transactionId,
    userId,
    paymentType: metadata.type,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  }, 'Processing successful payment intent');

  try {
    if (metadata.type === 'subscription') {
      logger.info({
        userId,
        planId: metadata.planId,
        transactionId,
      }, 'Creating subscription from successful payment');
      // Create subscription
      await userSubscriptionService.create({
        userId,
        planId: metadata.planId,
        paymentMethod: 'stripe',
        transactionId,
        autoRenew: true,
      });
      logger.info({
        userId,
        planId: metadata.planId,
        transactionId,
      }, 'Subscription created successfully');
    } else if (metadata.type === 'template') {
      logger.info({
        userId,
        templateId: metadata.templateId,
        transactionId,
      }, 'Creating template purchase from successful payment');
      // Create template purchase
      await templatePurchaseService.create({
        userId,
        templateId: metadata.templateId,
        paymentMethod: 'stripe',
        transactionId,
      });
      logger.info({
        userId,
        templateId: metadata.templateId,
        transactionId,
      }, 'Template purchase created successfully');
    } else {
      logger.warn({
        userId,
        transactionId,
        paymentType: metadata.type,
      }, 'Unknown payment type in successful payment intent');
    }
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId,
      transactionId,
      paymentType: metadata.type,
    }, 'Failed to process successful payment intent');
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  const metadata = paymentIntent.metadata;
  const userId = metadata.userId;
  const transactionId = paymentIntent.id;

  logger.error({
    paymentIntentId: transactionId,
    userId,
    paymentType: metadata.type,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    error: paymentIntent.last_payment_error,
    failureCode: paymentIntent.last_payment_error?.code,
    failureMessage: paymentIntent.last_payment_error?.message,
  }, 'Payment intent failed');
  // You might want to notify the user or log this for retry
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: any) {
  logger.info({
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
  }, 'Stripe subscription updated');
  // Update subscription status if needed
  // This is useful for tracking Stripe subscription lifecycle
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: any) {
  logger.info({
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    canceledAt: subscription.canceled_at,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  }, 'Stripe subscription deleted');
  // Cancel subscription in our database
  // Find subscription by Stripe subscription ID in metadata
  // You might want to update the subscription status to 'cancelled'
}

/**
 * Handle Bakong webhook events
 */
export const bakongWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers['x-bakong-signature'] as string;

  logger.info({
    hasSignature: !!signature,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, 'Bakong webhook received');

  if (!signature) {
    logger.warn({
      ip: req.ip,
    }, 'Bakong webhook missing signature header');
    return res.status(httpStatus.BAD_REQUEST).json({ error: 'Missing x-bakong-signature header' });
  }

  try {
    const isValid = bakongService.verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      logger.warn({
        ip: req.ip,
      }, 'Bakong webhook invalid signature');
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid webhook signature' });
    }
    logger.debug({}, 'Bakong webhook signature verified');
  } catch (error: any) {
    logger.error({
      error: error.message,
      ip: req.ip,
    }, 'Bakong webhook signature verification error');
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }

  // Handle different event types
  try {
    const event = req.body;
    const eventType = event.type || event.eventType;

    logger.info({
      eventType,
      transactionId: event.data?.transactionId || event.transactionId,
    }, 'Processing Bakong webhook event');

    switch (eventType) {
      case 'payment.completed':
      case 'transaction.completed':
        logger.info({
          eventType,
          transactionId: event.data?.transactionId || event.transactionId,
        }, 'Processing Bakong payment completed event');
        await handleBakongPaymentCompleted(event.data || event);
        break;

      case 'payment.failed':
      case 'transaction.failed':
        logger.info({
          eventType,
          transactionId: event.data?.transactionId || event.transactionId,
        }, 'Processing Bakong payment failed event');
        await handleBakongPaymentFailed(event.data || event);
        break;

      case 'payment.expired':
      case 'transaction.expired':
        logger.info({
          eventType,
          transactionId: event.data?.transactionId || event.transactionId,
        }, 'Processing Bakong payment expired event');
        await handleBakongPaymentExpired(event.data || event);
        break;

      default:
        logger.debug({
          eventType,
        }, 'Unhandled Bakong webhook event type');
    }

    logger.info({
      eventType,
      transactionId: event.data?.transactionId || event.transactionId,
    }, 'Bakong webhook processed successfully');

    return res.status(httpStatus.OK).json(buildSuccessResponse({ received: true }));
  } catch (error: any) {
    logger.error({
      error: error.message,
      eventType: req.body.type || req.body.eventType,
      stack: error.stack,
    }, 'Bakong webhook handler error');
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
};

/**
 * Handle successful Bakong payment
 */
async function handleBakongPaymentCompleted(paymentData: any) {
  const metadata = paymentData.metadata || {};
  const userId = metadata.userId;
  const transactionId = paymentData.transactionId || paymentData.id;

  logger.info({
    transactionId,
    userId,
    paymentType: metadata.type,
    amount: paymentData.amount,
    currency: paymentData.currency,
  }, 'Processing completed Bakong payment');

  try {
    if (metadata.type === 'subscription') {
      logger.info({
        userId,
        planId: metadata.planId,
        transactionId,
      }, 'Creating subscription from completed Bakong payment');
      // Create subscription
      await userSubscriptionService.create({
        userId,
        planId: metadata.planId,
        paymentMethod: 'bakong',
        transactionId,
        autoRenew: true,
      });
      logger.info({
        userId,
        planId: metadata.planId,
        transactionId,
      }, 'Subscription created successfully from Bakong payment');
    } else if (metadata.type === 'template') {
      logger.info({
        userId,
        templateId: metadata.templateId,
        transactionId,
      }, 'Creating template purchase from completed Bakong payment');
      // Create template purchase
      await templatePurchaseService.create({
        userId,
        templateId: metadata.templateId,
        paymentMethod: 'bakong',
        transactionId,
      });
      logger.info({
        userId,
        templateId: metadata.templateId,
        transactionId,
      }, 'Template purchase created successfully from Bakong payment');
    } else {
      logger.warn({
        userId,
        transactionId,
        paymentType: metadata.type,
      }, 'Unknown payment type in completed Bakong payment');
    }
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId,
      transactionId,
      paymentType: metadata.type,
    }, 'Failed to process completed Bakong payment');
    throw error;
  }
}

/**
 * Handle failed Bakong payment
 */
async function handleBakongPaymentFailed(paymentData: any) {
  const metadata = paymentData.metadata || {};
  const userId = metadata.userId;
  const transactionId = paymentData.transactionId || paymentData.id;

  logger.error({
    transactionId,
    userId,
    paymentType: metadata.type,
    amount: paymentData.amount,
    currency: paymentData.currency,
    error: paymentData.error || paymentData.message,
    failureReason: paymentData.failureReason,
  }, 'Bakong payment failed');
  // You might want to notify the user or log this for retry
}

/**
 * Handle expired Bakong payment
 */
async function handleBakongPaymentExpired(paymentData: any) {
  const metadata = paymentData.metadata || {};
  const userId = metadata.userId;
  const transactionId = paymentData.transactionId || paymentData.id;

  logger.info({
    transactionId,
    userId,
    paymentType: metadata.type,
    amount: paymentData.amount,
    currency: paymentData.currency,
    expiredAt: paymentData.expiredAt,
  }, 'Bakong payment expired');
  // You might want to notify the user that the payment expired
}

