import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '@/common/errors/app-error';
import { userSubscriptionRepository } from './user-subscription.repository';
import { subscriptionPlanRepository } from './subscription-plan.repository';
import type { UserSubscriptionDocument } from './user-subscription.model';
import type { SubscriptionPlanResponse } from './subscription-plan.service';

export interface CreateUserSubscriptionInput {
  userId: string;
  planId: string;
  paymentMethod?: string;
  transactionId?: string;
  autoRenew?: boolean;
}

export interface UserSubscriptionResponse {
  id: string;
  userId: string;
  planId: string | SubscriptionPlanResponse;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type UserSubscriptionSource = UserSubscriptionDocument | (Record<string, any> & { _id?: unknown }) | null;

export const sanitizeUserSubscription = (
  subscription: UserSubscriptionSource
): UserSubscriptionResponse | null => {
  if (!subscription) {
    return null;
  }
  const subObj =
    typeof (subscription as UserSubscriptionDocument).toObject === 'function'
      ? (subscription as UserSubscriptionDocument).toObject()
      : subscription;
  const { _id, __v, ...rest } = subObj as Record<string, any>;
  return {
    ...(rest as Omit<UserSubscriptionResponse, 'id'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
  } as UserSubscriptionResponse;
};

class UserSubscriptionService {
  async create(payload: CreateUserSubscriptionInput): Promise<UserSubscriptionResponse> {
    // Verify plan exists
    const plan = await subscriptionPlanRepository.findById(payload.planId);
    if (!plan) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }

    // Cancel any existing active subscriptions
    await userSubscriptionRepository.updateByUserId(payload.userId, {
      $set: { status: 'cancelled', cancelledAt: new Date() },
    });

    // Calculate end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();
    if (plan.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await userSubscriptionRepository.create({
      userId: new Types.ObjectId(payload.userId),
      planId: new Types.ObjectId(payload.planId),
      status: 'active',
      startDate,
      endDate,
      autoRenew: payload.autoRenew ?? true,
      paymentMethod: payload.paymentMethod,
      transactionId: payload.transactionId,
    });

    const safeSubscription = sanitizeUserSubscription(subscription);
    if (!safeSubscription) {
      throw new AppError('Unable to create subscription', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeSubscription;
  }

  async findById(id: string): Promise<UserSubscriptionResponse | null> {
    const subscription = await userSubscriptionRepository.findById(id);
    return sanitizeUserSubscription(subscription as unknown as UserSubscriptionDocument);
  }

  async findByUserId(userId: string): Promise<UserSubscriptionResponse[]> {
    const subscriptions = await userSubscriptionRepository.findByUserId(userId);
    return subscriptions
      .map((sub) => sanitizeUserSubscription(sub as unknown as UserSubscriptionDocument))
      .filter(Boolean) as UserSubscriptionResponse[];
  }

  async findActiveByUserId(userId: string): Promise<UserSubscriptionResponse | null> {
    const subscription = await userSubscriptionRepository.findActiveByUserId(userId);
    return sanitizeUserSubscription(subscription as unknown as UserSubscriptionDocument);
  }

  async cancelSubscription(subscriptionId: string, userId: string): Promise<UserSubscriptionResponse> {
    const subscription = await userSubscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }

    // Verify ownership
    const subUserId = typeof subscription.userId === 'object' && subscription.userId?._id
      ? subscription.userId._id.toString()
      : subscription.userId?.toString() || '';
    
    if (subUserId !== userId) {
      throw new AppError('You can only cancel your own subscription', httpStatus.FORBIDDEN);
    }

    const updated = await userSubscriptionRepository.updateById(subscriptionId, {
      $set: { status: 'cancelled', cancelledAt: new Date(), autoRenew: false },
    });

    if (!updated) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }

    const safeSubscription = sanitizeUserSubscription(updated as unknown as UserSubscriptionDocument);
    if (!safeSubscription) {
      throw new AppError('Unable to cancel subscription', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeSubscription;
  }

  async getMaxEventsForUser(userId: string): Promise<number | null> {
    // Admins have unlimited events
    // This will be checked in the controller using req.user.role

    const activeSubscription = await userSubscriptionRepository.findActiveByUserId(userId);
    if (!activeSubscription) {
      // Default limit for users without subscription
      return 5;
    }

    // Handle populated planId
    const plan = activeSubscription.planId as any;
    if (plan) {
      // If planId is populated, it will be an object
      const maxEvents = plan._id ? plan.maxEvents : (plan as any).maxEvents;
      if (maxEvents !== null && maxEvents !== undefined) {
        return maxEvents;
      }
    }

    // null means unlimited
    return null;
  }

  /**
   * Upgrade or downgrade subscription
   */
  async changeSubscription(
    userId: string,
    newPlanId: string,
    paymentMethod?: string,
    transactionId?: string
  ): Promise<UserSubscriptionResponse> {
    // Verify new plan exists
    const newPlan = await subscriptionPlanRepository.findById(newPlanId);
    if (!newPlan) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }

    // Get current active subscription
    const currentSubscription = await userSubscriptionRepository.findActiveByUserId(userId);
    
    if (currentSubscription) {
      // Cancel current subscription
      const currentSubId = (currentSubscription as any)._id?.toString() || (currentSubscription as any).id;
      if (currentSubId) {
        await userSubscriptionRepository.updateById(currentSubId, {
          $set: { status: 'cancelled', cancelledAt: new Date() },
        });
      }
    }

    // Create new subscription
    return await this.create({
      userId,
      planId: newPlanId,
      paymentMethod,
      transactionId,
      autoRenew: true,
    });
  }

  async list(filter: any = {}): Promise<UserSubscriptionResponse[]> {
    const subscriptions = await userSubscriptionRepository.list(filter);
    return subscriptions
      .map((sub) => sanitizeUserSubscription(sub as unknown as UserSubscriptionDocument))
      .filter(Boolean) as UserSubscriptionResponse[];
  }
}

export const userSubscriptionService = new UserSubscriptionService();

