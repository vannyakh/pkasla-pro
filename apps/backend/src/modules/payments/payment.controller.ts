import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { stripeService } from './stripe.service';
import { bakongService } from './bakong.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { subscriptionPlanService } from '@/modules/subscriptions/subscription-plan.service';
import { templateService } from '@/modules/t/template.service';
import { logger } from '@/utils/logger';

/**
 * Create payment intent for subscription
 */
export const createSubscriptionPaymentIntentHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.warn({ ip: req.ip }, 'Unauthorized attempt to create subscription payment intent');
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { planId } = req.body;

  logger.info({
    userId: req.user.id,
    planId,
    ip: req.ip,
  }, 'Creating subscription payment intent request received');

  try {
    // Get plan details
    const plan = await subscriptionPlanService.findByIdOrFail(planId);

    const paymentIntent = await stripeService.createSubscriptionPaymentIntent({
      userId: req.user.id,
      planId: plan.id,
      planName: plan.displayName,
      amount: plan.price,
      billingCycle: plan.billingCycle,
    });

    logger.info({
      userId: req.user.id,
      planId,
      paymentIntentId: paymentIntent.paymentIntentId,
    }, 'Subscription payment intent created successfully');

    return res.status(httpStatus.OK).json(buildSuccessResponse(paymentIntent));
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId: req.user.id,
      planId,
    }, 'Failed to create subscription payment intent');
    throw error;
  }
};

/**
 * Create payment intent for template purchase
 */
export const createTemplatePaymentIntentHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.warn({ ip: req.ip }, 'Unauthorized attempt to create template payment intent');
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { templateId } = req.body;

  logger.info({
    userId: req.user.id,
    templateId,
    ip: req.ip,
  }, 'Creating template payment intent request received');

  try {
    // Get template details
    const template = await templateService.findByIdOrFail(templateId);

    if (!template.price || template.price === 0) {
      logger.info({
        userId: req.user.id,
        templateId,
      }, 'Template is free, no payment required');
      return res.status(httpStatus.BAD_REQUEST).json({ 
        error: 'This template is free and does not require payment' 
      });
    }

    const paymentIntent = await stripeService.createTemplatePaymentIntent({
      userId: req.user.id,
      templateId: template.id,
      templateName: template.title,
      amount: template.price,
    });

    logger.info({
      userId: req.user.id,
      templateId,
      paymentIntentId: paymentIntent.paymentIntentId,
    }, 'Template payment intent created successfully');

    return res.status(httpStatus.OK).json(buildSuccessResponse(paymentIntent));
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId: req.user.id,
      templateId,
    }, 'Failed to create template payment intent');
    throw error;
  }
};

/**
 * Create Bakong KHQR payment for subscription
 */
export const createBakongSubscriptionPaymentHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.warn({ ip: req.ip }, 'Unauthorized attempt to create Bakong subscription payment');
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { planId } = req.body;

  logger.info({
    userId: req.user.id,
    planId,
    ip: req.ip,
  }, 'Creating Bakong subscription payment request received');

  try {
    // Get plan details
    const plan = await subscriptionPlanService.findByIdOrFail(planId);

    const payment = await bakongService.createSubscriptionPayment({
      userId: req.user.id,
      amount: plan.price,
      currency: 'USD',
      metadata: {
        planId: plan.id,
        planName: plan.displayName,
        billingCycle: plan.billingCycle,
        type: 'subscription',
      },
    });

    logger.info({
      userId: req.user.id,
      planId,
      transactionId: payment.transactionId,
    }, 'Bakong subscription payment created successfully');

    return res.status(httpStatus.OK).json(buildSuccessResponse(payment));
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId: req.user.id,
      planId,
    }, 'Failed to create Bakong subscription payment');
    throw error;
  }
};

/**
 * Create Bakong KHQR payment for template purchase
 */
export const createBakongTemplatePaymentHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.warn({ ip: req.ip }, 'Unauthorized attempt to create Bakong template payment');
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { templateId } = req.body;

  logger.info({
    userId: req.user.id,
    templateId,
    ip: req.ip,
  }, 'Creating Bakong template payment request received');

  try {
    // Get template details
    const template = await templateService.findByIdOrFail(templateId);

    if (!template.price || template.price === 0) {
      logger.info({
        userId: req.user.id,
        templateId,
      }, 'Template is free, no payment required');
      return res.status(httpStatus.BAD_REQUEST).json({ 
        error: 'This template is free and does not require payment' 
      });
    }

    const payment = await bakongService.createTemplatePayment({
      userId: req.user.id,
      amount: template.price,
      currency: 'USD',
      metadata: {
        templateId: template.id,
        templateName: template.title,
        type: 'template',
      },
    });

    logger.info({
      userId: req.user.id,
      templateId,
      transactionId: payment.transactionId,
    }, 'Bakong template payment created successfully');

    // Return response with explicit fields (including transactionId for frontend compatibility)
    const response = {
      qrCode: payment.qrCode,
      expiresAt: payment.expiresAt,
      currency: payment.currency,
      amount: payment.amount,
      transactionId: payment.transactionId,
    };

    return res.status(httpStatus.OK).json(buildSuccessResponse(response));
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId: req.user.id,
      templateId,
    }, 'Failed to create Bakong template payment');
    throw error;
  }
};

/**
 * Check Bakong transaction status
 * Supports checking by transactionId (from params) or MD5 hash (from query)
 */
export const getBakongTransactionStatusHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.warn({ ip: req.ip }, 'Unauthorized attempt to get Bakong transaction status');
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { transactionId } = req.params;
  const { md5 } = req.query;

  try {
    // If MD5 is provided in query, use it directly; otherwise lookup by transactionId
    const md5Hash = typeof md5 === 'string' ? md5 : undefined;
    const status = await bakongService.getTransactionStatus(transactionId, md5Hash);

    return res.status(httpStatus.OK).json(buildSuccessResponse(status));
  } catch (error: any) {
    logger.error({
      error: error.message,
      userId: req.user.id,
      transactionId,
      hasMd5: !!md5,
    }, 'Failed to get Bakong transaction status');
    throw error;
  }
};

