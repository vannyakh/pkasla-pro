import Stripe from 'stripe';
import { env } from '@/config/environment';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';
import { logger } from '@/utils/logger';
import { logPaymentEvent } from './payment-log.helper';

if (!env.stripe?.secretKey) {
  console.warn('Stripe secret key not configured. Payment features will not work.');
}

export const stripe = env.stripe?.secretKey
  ? new Stripe(env.stripe.secretKey, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

export interface CreateSubscriptionPaymentIntentInput {
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  currency?: string;
}

export interface CreateTemplatePaymentIntentInput {
  userId: string;
  templateId: string;
  templateName: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

class StripeService {
  private ensureStripe(): Stripe {
    if (!stripe) {
      throw new AppError('Stripe is not configured', httpStatus.SERVICE_UNAVAILABLE);
    }
    return stripe;
  }

  /**
   * Create a payment intent for subscription
   */
  async createSubscriptionPaymentIntent(
    input: CreateSubscriptionPaymentIntentInput
  ): Promise<PaymentIntentResponse> {
    try {
      logger.info({
        userId: input.userId,
        planId: input.planId,
        planName: input.planName,
        amount: input.amount,
        billingCycle: input.billingCycle,
        currency: input.currency,
      }, 'Creating Stripe subscription payment intent');

      const stripeInstance = this.ensureStripe();
      const amountInCents = Math.round(input.amount * 100);
      
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: amountInCents,
        currency: input.currency || 'usd',
        metadata: {
          userId: input.userId,
          planId: input.planId,
          planName: input.planName,
          billingCycle: input.billingCycle,
          type: 'subscription',
        },
        description: `Subscription: ${input.planName} (${input.billingCycle})`,
      });

      logger.info({
        paymentIntentId: paymentIntent.id,
        userId: input.userId,
        planId: input.planId,
        amount: input.amount,
        status: paymentIntent.status,
      }, 'Stripe subscription payment intent created successfully');

      // Log payment intent creation to database
      await logPaymentEvent({
        userId: input.userId,
        transactionId: paymentIntent.id,
        paymentMethod: 'stripe',
        paymentType: 'subscription',
        eventType: 'payment_intent_created',
        status: 'pending',
        amount: input.amount,
        currency: input.currency || 'usd',
        planId: input.planId,
        metadata: {
          planName: input.planName,
          billingCycle: input.billingCycle,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      logger.error({
        error: error.message,
        userId: input.userId,
        planId: input.planId,
        amount: input.amount,
        stripeError: error.type,
        stripeCode: error.code,
      }, 'Failed to create Stripe subscription payment intent');

      throw new AppError(
        `Failed to create payment intent: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a payment intent for template purchase
   */
  async createTemplatePaymentIntent(
    input: CreateTemplatePaymentIntentInput
  ): Promise<PaymentIntentResponse> {
    try {
      logger.info({
        userId: input.userId,
        templateId: input.templateId,
        templateName: input.templateName,
        amount: input.amount,
        currency: input.currency,
      }, 'Creating Stripe template payment intent');

      const stripeInstance = this.ensureStripe();
      const amountInCents = Math.round(input.amount * 100);
      
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: amountInCents,
        currency: input.currency || 'usd',
        metadata: {
          userId: input.userId,
          templateId: input.templateId,
          templateName: input.templateName,
          type: 'template',
        },
        description: `Template Purchase: ${input.templateName}`,
      });

      logger.info({
        paymentIntentId: paymentIntent.id,
        userId: input.userId,
        templateId: input.templateId,
        amount: input.amount,
        status: paymentIntent.status,
      }, 'Stripe template payment intent created successfully');

      // Log payment intent creation to database
      await logPaymentEvent({
        userId: input.userId,
        transactionId: paymentIntent.id,
        paymentMethod: 'stripe',
        paymentType: 'template',
        eventType: 'payment_intent_created',
        status: 'pending',
        amount: input.amount,
        currency: input.currency || 'usd',
        templateId: input.templateId,
        metadata: {
          templateName: input.templateName,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      logger.error({
        error: error.message,
        userId: input.userId,
        templateId: input.templateId,
        amount: input.amount,
        stripeError: error.type,
        stripeCode: error.code,
      }, 'Failed to create Stripe template payment intent');

      throw new AppError(
        `Failed to create payment intent: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      logger.debug({
        hasSignature: !!signature,
        payloadType: typeof payload,
        payloadLength: Buffer.isBuffer(payload) ? payload.length : payload.length,
      }, 'Verifying Stripe webhook signature');

      const stripeInstance = this.ensureStripe();
      const webhookSecret = env.stripe?.webhookSecret;
      if (!webhookSecret) {
        logger.error({}, 'Stripe webhook secret not configured');
        throw new AppError('Stripe webhook secret not configured', httpStatus.INTERNAL_SERVER_ERROR);
      }

      const event = stripeInstance.webhooks.constructEvent(payload, signature, webhookSecret);

      logger.info({
        eventId: event.id,
        eventType: event.type,
      }, 'Stripe webhook signature verified successfully');

      return event;
    } catch (error: any) {
      logger.error({
        error: error.message,
        hasSignature: !!signature,
        errorType: error.type,
      }, 'Stripe webhook signature verification failed');

      throw new AppError(
        `Webhook signature verification failed: ${error.message}`,
        httpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      logger.debug({ paymentIntentId }, 'Retrieving Stripe payment intent');

      const stripeInstance = this.ensureStripe();
      const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

      logger.info({
        paymentIntentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }, 'Stripe payment intent retrieved');

      return paymentIntent;
    } catch (error: any) {
      logger.error({
        error: error.message,
        paymentIntentId,
        stripeError: error.type,
        stripeCode: error.code,
      }, 'Failed to retrieve Stripe payment intent');

      throw new AppError(
        `Failed to retrieve payment intent: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    try {
      logger.info({
        email,
        name,
        hasMetadata: !!metadata,
      }, 'Creating Stripe customer');

      const stripeInstance = this.ensureStripe();
      const customer = await stripeInstance.customers.create({
        email,
        name,
        metadata,
      });

      logger.info({
        customerId: customer.id,
        email,
      }, 'Stripe customer created successfully');

      return customer;
    } catch (error: any) {
      logger.error({
        error: error.message,
        email,
        stripeError: error.type,
        stripeCode: error.code,
      }, 'Failed to create Stripe customer');

      throw new AppError(
        `Failed to create customer: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a subscription with Stripe
   */
  async createStripeSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    try {
      logger.info({
        customerId,
        priceId,
        hasMetadata: !!metadata,
      }, 'Creating Stripe subscription');

      const stripeInstance = this.ensureStripe();
      const subscription = await stripeInstance.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
      });

      logger.info({
        subscriptionId: subscription.id,
        customerId,
        status: subscription.status,
      }, 'Stripe subscription created successfully');

      return subscription;
    } catch (error: any) {
      logger.error({
        error: error.message,
        customerId,
        priceId,
        stripeError: error.type,
        stripeCode: error.code,
      }, 'Failed to create Stripe subscription');

      throw new AppError(
        `Failed to create subscription: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Cancel a Stripe subscription
   */
  async cancelStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      logger.info({ subscriptionId }, 'Cancelling Stripe subscription');

      const stripeInstance = this.ensureStripe();
      const subscription = await stripeInstance.subscriptions.cancel(subscriptionId);

      logger.info({
        subscriptionId,
        status: subscription.status,
      }, 'Stripe subscription cancelled successfully');

      return subscription;
    } catch (error: any) {
      logger.error({
        error: error.message,
        subscriptionId,
        stripeError: error.type,
        stripeCode: error.code,
      }, 'Failed to cancel Stripe subscription');

      throw new AppError(
        `Failed to cancel subscription: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const stripeService = new StripeService();

