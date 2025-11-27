import type { FilterQuery, UpdateQuery } from 'mongoose';
import { UserSubscriptionModel, type UserSubscriptionDocument } from './user-subscription.model';

export class UserSubscriptionRepository {
  create(payload: Partial<UserSubscriptionDocument>) {
    return UserSubscriptionModel.create(payload);
  }

  findById(id: string) {
    return UserSubscriptionModel.findById(id)
      .populate('userId', 'name email')
      .populate('planId')
      .lean();
  }

  findByUserId(userId: string) {
    return UserSubscriptionModel.find({ userId })
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();
  }

  findActiveByUserId(userId: string) {
    return UserSubscriptionModel.findOne({
      userId,
      status: 'active',
      endDate: { $gte: new Date() },
    })
      .populate('planId')
      .lean();
  }

  updateById(id: string, payload: UpdateQuery<UserSubscriptionDocument>) {
    return UserSubscriptionModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('planId')
      .lean();
  }

  updateByUserId(userId: string, payload: UpdateQuery<UserSubscriptionDocument>) {
    return UserSubscriptionModel.updateMany({ userId }, payload);
  }

  deleteById(id: string) {
    return UserSubscriptionModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<UserSubscriptionDocument> = {}) {
    return UserSubscriptionModel.find(filter)
      .populate('userId', 'name email')
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();
  }

  countDocuments(filter: FilterQuery<UserSubscriptionDocument> = {}) {
    return UserSubscriptionModel.countDocuments(filter);
  }

  // Find expired subscriptions that should be updated
  findExpiredSubscriptions() {
    return UserSubscriptionModel.find({
      status: 'active',
      endDate: { $lt: new Date() },
    })
      .populate('planId')
      .lean();
  }
}

export const userSubscriptionRepository = new UserSubscriptionRepository();

