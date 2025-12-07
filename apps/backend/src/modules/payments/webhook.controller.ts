import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { stripeService } from './stripe.service';
import { bakongService } from './bakong.service';
import { userSubscriptionService } from '@/modules/subscriptions/user-subscription.service';
import { templatePurchaseService } from '@/modules/t/template-purchase.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { logger } from '@/utils/logger';
import { logPaymentEvent } from './payment-log.helper';

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

  // Log webhook received event
  await logPaymentEvent({
    paymentMethod: 'stripe',
    eventType: 'webhook_received',
    status: 'pending',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    metadata: {
      hasSignature: !!signature,
    },
  });

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

    // Log webhook processed event
    await logPaymentEvent({
      paymentMethod: 'stripe',
      eventType: 'webhook_processed',
      status: 'completed',
      metadata: {
        eventId: event.id,
        eventType: event.type,
      },
    });

    return res.status(httpStatus.OK).json(buildSuccessResponse({ received: true }));
  } catch (error: any) {
    logger.error({
      error: error.message,
      eventId: event.id,
      eventType: event.type,
      stack: error.stack,
    }, 'Stripe webhook handler error');

    // Log webhook processing failure
    await logPaymentEvent({
      paymentMethod: 'stripe',
      eventType: 'webhook_failed',
      status: 'failed',
      error: error.message,
      metadata: {
        eventId: event.id,
        eventType: event.type,
      },
    });

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

      // Log successful payment
      await logPaymentEvent({
        userId,
        transactionId,
        paymentMethod: 'stripe',
        paymentType: 'subscription',
        eventType: 'payment_succeeded',
        status: 'completed',
        amount: paymentIntent.amount ? paymentIntent.amount / 100 : undefined,
        currency: paymentIntent.currency,
        planId: metadata.planId,
        metadata: {
          planName: metadata.planName,
          billingCycle: metadata.billingCycle,
        },
      });
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

      // Log successful payment
      await logPaymentEvent({
        userId,
        transactionId,
        paymentMethod: 'stripe',
        paymentType: 'template',
        eventType: 'payment_succeeded',
        status: 'completed',
        amount: paymentIntent.amount ? paymentIntent.amount / 100 : undefined,
        currency: paymentIntent.currency,
        templateId: metadata.templateId,
        metadata: {
          templateName: metadata.templateName,
        },
      });
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

  // Log failed payment
  await logPaymentEvent({
    userId,
    transactionId,
    paymentMethod: 'stripe',
    paymentType: metadata.type as 'subscription' | 'template' | undefined,
    eventType: 'payment_failed',
    status: 'failed',
    amount: paymentIntent.amount ? paymentIntent.amount / 100 : undefined,
    currency: paymentIntent.currency,
    planId: metadata.planId,
    templateId: metadata.templateId,
    error: paymentIntent.last_payment_error?.message || 'Payment failed',
    metadata: {
      failureCode: paymentIntent.last_payment_error?.code,
      failureMessage: paymentIntent.last_payment_error?.message,
    },
  });
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

  // Log webhook received event
  await logPaymentEvent({
    paymentMethod: 'bakong',
    eventType: 'webhook_received',
    status: 'pending',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    metadata: {
      hasSignature: !!signature,
    },
  });

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
    const eventType = event.type || event.eventType || event.event?.type;
    
    // Extract transaction ID from various possible locations in webhook payload
    const transactionId = 
      event.data?.transactionId || 
      event.data?.id || 
      event.data?.externalRef ||
      event.data?.billNumber ||
      event.transactionId || 
      event.id ||
      event.externalRef ||
      event.billNumber;

    logger.info({
      eventType,
      transactionId,
      eventKeys: Object.keys(event || {}),
      hasData: !!event.data,
    }, 'Processing Bakong webhook event');

    // Use event.data if available, otherwise use event itself
    const paymentData = event.data || event;

    switch (eventType) {
      case 'payment.completed':
      case 'transaction.completed':
      case 'payment_succeeded':
      case 'transaction_succeeded':
        logger.info({
          eventType,
          transactionId,
        }, 'Processing Bakong payment completed event');
        await handleBakongPaymentCompleted(paymentData);
        break;

      case 'payment.failed':
      case 'transaction.failed':
      case 'payment_failed':
      case 'transaction_failed':
        logger.info({
          eventType,
          transactionId,
        }, 'Processing Bakong payment failed event');
        await handleBakongPaymentFailed(paymentData);
        break;

      case 'payment.expired':
      case 'transaction.expired':
      case 'payment_expired':
      case 'transaction_expired':
        logger.info({
          eventType,
          transactionId,
        }, 'Processing Bakong payment expired event');
        await handleBakongPaymentExpired(paymentData);
        break;

      default:
        logger.debug({
          eventType,
          transactionId,
        }, 'Unhandled Bakong webhook event type');
    }

    const finalTransactionId = 
      event.data?.transactionId || 
      event.data?.id || 
      event.data?.externalRef ||
      event.transactionId || 
      event.id;

    logger.info({
      eventType,
      transactionId: finalTransactionId,
    }, 'Bakong webhook processed successfully');

    // Log webhook processed event
    await logPaymentEvent({
      paymentMethod: 'bakong',
      eventType: 'webhook_processed',
      status: 'completed',
      transactionId: finalTransactionId,
      metadata: {
        eventType,
        webhookPayload: event,
      },
    });

    return res.status(httpStatus.OK).json(buildSuccessResponse({ received: true }));
  } catch (error: any) {
    logger.error({
      error: error.message,
      eventType: req.body.type || req.body.eventType,
      stack: error.stack,
    }, 'Bakong webhook handler error');

    // Log webhook processing failure
    await logPaymentEvent({
      paymentMethod: 'bakong',
      eventType: 'webhook_failed',
      status: 'failed',
      error: error.message,
      metadata: {
        eventType: req.body.type || req.body.eventType,
      },
    });

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
  // Extract transaction ID from various possible fields in webhook payload
  const transactionId = 
    paymentData.transactionId || 
    paymentData.id || 
    paymentData.externalRef || 
    paymentData.billNumber ||
    paymentData.md5; // Sometimes webhook might send MD5 hash

  if (!transactionId) {
    logger.error({
      paymentDataKeys: Object.keys(paymentData || {}),
    }, 'Bakong webhook missing transaction ID');
    throw new Error('Transaction ID not found in webhook payload');
  }

  logger.info({
    transactionId,
    paymentDataKeys: Object.keys(paymentData || {}),
    amount: paymentData.amount,
    currency: paymentData.currency,
  }, 'Processing completed Bakong payment webhook');

  try {
    // Look up payment log to get metadata (userId, templateId, planId, etc.)
    const { PaymentLogModel } = await import('./payment-log.model');
    const paymentLog = await PaymentLogModel.findOne({
      transactionId,
      paymentMethod: 'bakong',
      eventType: 'payment_created',
    }).sort({ createdAt: -1 });

    if (!paymentLog) {
      logger.warn({
        transactionId,
      }, 'Payment log not found for completed Bakong payment');
      // Still log the webhook event even if payment log not found
      await logPaymentEvent({
        transactionId,
        paymentMethod: 'bakong',
        eventType: 'payment_succeeded',
        status: 'completed',
        amount: paymentData.amount,
        currency: paymentData.currency,
        metadata: {
          webhookData: paymentData,
          paymentLogNotFound: true,
        },
      });
      return; // Exit early if payment log not found
    }

    // Update payment log status if it's still pending
    if (paymentLog.status === 'pending') {
      paymentLog.status = 'completed';
      await paymentLog.save();
      logger.info(
        { transactionId },
        'Updated payment log status to completed from webhook'
      );
    }

    // Get metadata from payment log
    const metadata = paymentLog.metadata || {};
    const userId = paymentLog.userId?.toString() || metadata.userId;
    const paymentType = paymentLog.paymentType || metadata.type;

    if (!userId) {
      logger.error({
        transactionId,
      }, 'User ID not found in payment log for completed Bakong payment');
      throw new Error('User ID not found in payment log');
    }

    logger.info({
      transactionId,
      userId,
      paymentType,
      amount: paymentData.amount || paymentLog.amount,
      currency: paymentData.currency || paymentLog.currency,
    }, 'Processing completed Bakong payment with metadata from payment log');

    if (paymentType === 'subscription') {
      const planId = paymentLog.planId?.toString() || metadata.planId;
      
      if (!planId) {
        logger.error({
          transactionId,
          userId,
        }, 'Plan ID not found in payment log for subscription payment');
        throw new Error('Plan ID not found in payment log');
      }

      logger.info({
        userId,
        planId,
        transactionId,
      }, 'Creating subscription from completed Bakong payment webhook');

      // Check if subscription already exists
      const { UserSubscriptionModel } = await import('@/modules/subscriptions/user-subscription.model');
      const existingSubscription = await UserSubscriptionModel.findOne({
        transactionId,
      });

      if (!existingSubscription) {
        // Create subscription
        await userSubscriptionService.create({
          userId,
          planId,
          paymentMethod: 'bakong',
          transactionId,
          autoRenew: true,
        });
        logger.info({
          userId,
          planId,
          transactionId,
        }, 'Subscription created successfully from Bakong payment webhook');
      } else {
        logger.debug({
          userId,
          planId,
          transactionId,
        }, 'Subscription already exists, skipping creation');
      }

      // Log successful payment
      await logPaymentEvent({
        userId,
        transactionId,
        paymentMethod: 'bakong',
        paymentType: 'subscription',
        eventType: 'payment_succeeded',
        status: 'completed',
        amount: paymentData.amount || paymentLog.amount,
        currency: paymentData.currency || paymentLog.currency,
        planId,
        metadata: {
          planName: metadata.planName,
          billingCycle: metadata.billingCycle,
          triggeredBy: 'webhook',
        },
      });
    } else if (paymentType === 'template') {
      const templateId = paymentLog.templateId?.toString() || metadata.templateId;
      
      if (!templateId) {
        logger.error({
          transactionId,
          userId,
        }, 'Template ID not found in payment log for template payment');
        throw new Error('Template ID not found in payment log');
      }

      logger.info({
        userId,
        templateId,
        transactionId,
      }, 'Creating template purchase from completed Bakong payment webhook');

      // Check if purchase already exists
      const { TemplatePurchaseModel } = await import('@/modules/t/template-purchase.model');
      const existingPurchase = await TemplatePurchaseModel.findOne({
        transactionId,
      });

      if (!existingPurchase) {
        // Create template purchase
        await templatePurchaseService.create({
          userId,
          templateId,
          paymentMethod: 'bakong',
          transactionId,
        });
        logger.info({
          userId,
          templateId,
          transactionId,
        }, 'Template purchase created successfully from Bakong payment webhook');
      } else {
        logger.debug({
          userId,
          templateId,
          transactionId,
        }, 'Template purchase already exists, skipping creation');
      }

      // Log successful payment
      await logPaymentEvent({
        userId,
        transactionId,
        paymentMethod: 'bakong',
        paymentType: 'template',
        eventType: 'payment_succeeded',
        status: 'completed',
        amount: paymentData.amount || paymentLog.amount,
        currency: paymentData.currency || paymentLog.currency,
        templateId,
        metadata: {
          templateName: metadata.templateName,
          triggeredBy: 'webhook',
        },
      });
    } else {
      logger.warn({
        userId,
        transactionId,
        paymentType,
      }, 'Unknown payment type in completed Bakong payment webhook');
    }
  } catch (error: any) {
    logger.error({
      error: error.message,
      transactionId,
      stack: error.stack,
    }, 'Failed to process completed Bakong payment webhook');
    throw error;
  }
}

/**
 * Handle failed Bakong payment
 */
async function handleBakongPaymentFailed(paymentData: any) {
  // Extract transaction ID from various possible fields
  const transactionId = 
    paymentData.transactionId || 
    paymentData.id || 
    paymentData.externalRef || 
    paymentData.billNumber;

  logger.error({
    transactionId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    error: paymentData.error || paymentData.message,
    failureReason: paymentData.failureReason,
  }, 'Bakong payment failed webhook received');

  try {
    // Look up payment log to get metadata
    const { PaymentLogModel } = await import('./payment-log.model');
    const paymentLog = transactionId ? await PaymentLogModel.findOne({
      transactionId,
      paymentMethod: 'bakong',
      eventType: 'payment_created',
    }).sort({ createdAt: -1 }) : null;

    const metadata = paymentLog?.metadata || {};
    const userId = paymentLog?.userId?.toString() || metadata.userId;
    const paymentType = paymentLog?.paymentType || metadata.type;

    // Update payment log status if it exists
    if (paymentLog && paymentLog.status === 'pending') {
      paymentLog.status = 'failed';
      await paymentLog.save();
    }

    // Log failed payment
    await logPaymentEvent({
      userId,
      transactionId,
      paymentMethod: 'bakong',
      paymentType: paymentType as 'subscription' | 'template' | undefined,
      eventType: 'payment_failed',
      status: 'failed',
      amount: paymentData.amount || paymentLog?.amount,
      currency: paymentData.currency || paymentLog?.currency,
      planId: paymentLog?.planId?.toString() || metadata.planId,
      templateId: paymentLog?.templateId?.toString() || metadata.templateId,
      error: paymentData.error || paymentData.message || 'Payment failed',
      metadata: {
        failureReason: paymentData.failureReason,
        triggeredBy: 'webhook',
      },
    });
  } catch (error: any) {
    logger.error({
      error: error.message,
      transactionId,
    }, 'Failed to process Bakong payment failed webhook');
    // Don't throw - we still want to acknowledge the webhook
  }
  // You might want to notify the user or log this for retry
}

/**
 * Handle expired Bakong payment
 */
async function handleBakongPaymentExpired(paymentData: any) {
  // Extract transaction ID from various possible fields
  const transactionId = 
    paymentData.transactionId || 
    paymentData.id || 
    paymentData.externalRef || 
    paymentData.billNumber;

  logger.info({
    transactionId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    expiredAt: paymentData.expiredAt,
  }, 'Bakong payment expired webhook received');

  try {
    // Look up payment log to get metadata
    const { PaymentLogModel } = await import('./payment-log.model');
    const paymentLog = transactionId ? await PaymentLogModel.findOne({
      transactionId,
      paymentMethod: 'bakong',
      eventType: 'payment_created',
    }).sort({ createdAt: -1 }) : null;

    const metadata = paymentLog?.metadata || {};
    const userId = paymentLog?.userId?.toString() || metadata.userId;
    const paymentType = paymentLog?.paymentType || metadata.type;

    // Update payment log status if it exists
    if (paymentLog && paymentLog.status === 'pending') {
      paymentLog.status = 'expired';
      await paymentLog.save();
    }

    // Log expired payment
    await logPaymentEvent({
      userId,
      transactionId,
      paymentMethod: 'bakong',
      paymentType: paymentType as 'subscription' | 'template' | undefined,
      eventType: 'payment_expired',
      status: 'expired',
      amount: paymentData.amount || paymentLog?.amount,
      currency: paymentData.currency || paymentLog?.currency,
      planId: paymentLog?.planId?.toString() || metadata.planId,
      templateId: paymentLog?.templateId?.toString() || metadata.templateId,
      metadata: {
        expiredAt: paymentData.expiredAt,
        triggeredBy: 'webhook',
      },
    });
  } catch (error: any) {
    logger.error({
      error: error.message,
      transactionId,
    }, 'Failed to process Bakong payment expired webhook');
    // Don't throw - we still want to acknowledge the webhook
  }
  // You might want to notify the user that the payment expired
}

