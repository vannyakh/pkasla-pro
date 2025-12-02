import { paymentLogRepository, type PaymentLogFilters } from './payment-log.repository';
import type { Types } from 'mongoose';

export interface CreatePaymentLogInput {
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

class PaymentLogService {
  async create(input: CreatePaymentLogInput) {
    return await paymentLogRepository.create(input);
  }

  async findById(id: string) {
    return await paymentLogRepository.findById(id);
  }

  async list(
    filters: PaymentLogFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const [items, total] = await Promise.all([
      paymentLogRepository.listPaginated(filters, page, limit),
      paymentLogRepository.countDocuments(filters),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(filters?: PaymentLogFilters) {
    return await paymentLogRepository.getStats(filters);
  }
}

export const paymentLogService = new PaymentLogService();

