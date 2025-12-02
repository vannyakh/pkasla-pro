import { paymentLogService } from './payment-log.service';
import { logger } from '@/utils/logger';
import type { Types } from 'mongoose';

export interface LogPaymentEventInput {
  userId?: Types.ObjectId | string;
  transactionId?: string;
  paymentMethod?: 'stripe' | 'bakong';
  paymentType?: 'subscription' | 'template';
  eventType: string;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';
  amount?: number;
  currency?: string;
  planId?: Types.ObjectId | string;
  templateId?: Types.ObjectId | string;
  metadata?: Record<string, any>;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Helper function to log payment events to database
 * This is called asynchronously and errors are logged but don't throw
 */
export async function logPaymentEvent(input: LogPaymentEventInput): Promise<void> {
  try {
    await paymentLogService.create(input);
  } catch (error: any) {
    // Log the error but don't throw - payment logging should not break payment flow
    logger.error(
      {
        error: error.message,
        eventType: input.eventType,
        transactionId: input.transactionId,
      },
      'Failed to log payment event to database'
    );
  }
}

