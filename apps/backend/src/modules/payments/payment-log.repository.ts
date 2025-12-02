import { PaymentLogModel, type PaymentLogDocument } from './payment-log.model';
import type { Types } from 'mongoose';

export interface PaymentLogFilters {
  userId?: string;
  transactionId?: string;
  paymentMethod?: 'stripe' | 'bakong';
  paymentType?: 'subscription' | 'template';
  eventType?: string;
  status?: 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export class PaymentLogRepository {
  async create(data: {
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
  }): Promise<PaymentLogDocument> {
    return await PaymentLogModel.create(data);
  }

  async findById(id: string): Promise<PaymentLogDocument | null> {
    return await PaymentLogModel.findById(id)
      .populate('userId', 'name email')
      .populate('planId', 'displayName price')
      .populate('templateId', 'title price')
      .exec();
  }

  async listPaginated(
    filters: PaymentLogFilters,
    page: number = 1,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaymentLogDocument[]> {
    const query = this.buildQuery(filters);
    const skip = (page - 1) * limit;

    return await PaymentLogModel.find(query)
      .populate('userId', 'name email')
      .populate('planId', 'displayName price')
      .populate('templateId', 'title price')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countDocuments(filters: PaymentLogFilters): Promise<number> {
    const query = this.buildQuery(filters);
    return await PaymentLogModel.countDocuments(query).exec();
  }

  async getStats(filters?: PaymentLogFilters) {
    const query = this.buildQuery(filters || {});
    
    const [
      total,
      byStatus,
      byPaymentMethod,
      byPaymentType,
      byEventType,
      totalAmount,
    ] = await Promise.all([
      PaymentLogModel.countDocuments(query),
      PaymentLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      PaymentLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
      ]),
      PaymentLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$paymentType', count: { $sum: 1 } } },
      ]),
      PaymentLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
      ]),
      PaymentLogModel.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byPaymentMethod: byPaymentMethod.reduce((acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byPaymentType: byPaymentType.reduce((acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byEventType: byEventType.reduce((acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {} as Record<string, number>),
      totalAmount: totalAmount[0]?.total || 0,
    };
  }

  private buildQuery(filters: PaymentLogFilters): Record<string, any> {
    const query: Record<string, any> = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.transactionId) {
      query.transactionId = { $regex: filters.transactionId, $options: 'i' };
    }

    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters.paymentType) {
      query.paymentType = filters.paymentType;
    }

    if (filters.eventType) {
      query.eventType = filters.eventType;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    if (filters.search) {
      query.$or = [
        { transactionId: { $regex: filters.search, $options: 'i' } },
        { error: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }
}

export const paymentLogRepository = new PaymentLogRepository();

