import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { subscriptionPlanRepository } from './subscription-plan.repository';
import type { SubscriptionPlanDocument } from './subscription-plan.model';

export interface CreateSubscriptionPlanInput {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  maxEvents: number | null;
  features: string[];
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanInput {
  displayName?: string;
  description?: string;
  price?: number;
  billingCycle?: 'monthly' | 'yearly';
  maxEvents?: number | null;
  features?: string[];
  isActive?: boolean;
}

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  maxEvents: number | null;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type SubscriptionPlanSource = SubscriptionPlanDocument | (Record<string, any> & { _id?: unknown }) | null;

export const sanitizeSubscriptionPlan = (
  plan: SubscriptionPlanSource
): SubscriptionPlanResponse | null => {
  if (!plan) {
    return null;
  }
  const planObj =
    typeof (plan as SubscriptionPlanDocument).toObject === 'function'
      ? (plan as SubscriptionPlanDocument).toObject()
      : plan;
  const { _id, __v, ...rest } = planObj as Record<string, any>;
  return {
    ...(rest as Omit<SubscriptionPlanResponse, 'id'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
  } as SubscriptionPlanResponse;
};

class SubscriptionPlanService {
  async create(payload: CreateSubscriptionPlanInput): Promise<SubscriptionPlanResponse> {
    // Check if plan name already exists
    const existing = await subscriptionPlanRepository.findByName(payload.name);
    if (existing) {
      throw new AppError('Subscription plan name already exists', httpStatus.CONFLICT);
    }

    const plan = await subscriptionPlanRepository.create({
      ...payload,
      name: payload.name.toLowerCase(),
    });
    const safePlan = sanitizeSubscriptionPlan(plan);
    if (!safePlan) {
      throw new AppError('Unable to create subscription plan', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safePlan;
  }

  async findById(id: string): Promise<SubscriptionPlanResponse | null> {
    const plan = await subscriptionPlanRepository.findById(id);
    return sanitizeSubscriptionPlan(plan as unknown as SubscriptionPlanDocument);
  }

  async findByIdOrFail(id: string): Promise<SubscriptionPlanResponse> {
    const plan = await this.findById(id);
    if (!plan) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }
    return plan;
  }

  async findByName(name: string): Promise<SubscriptionPlanResponse | null> {
    const plan = await subscriptionPlanRepository.findByName(name);
    return sanitizeSubscriptionPlan(plan as unknown as SubscriptionPlanDocument);
  }

  async updateById(id: string, payload: UpdateSubscriptionPlanInput): Promise<SubscriptionPlanResponse> {
    const existing = await subscriptionPlanRepository.findById(id);
    if (!existing) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }

    const updated = await subscriptionPlanRepository.updateById(id, { $set: payload });
    if (!updated) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }

    const safePlan = sanitizeSubscriptionPlan(updated as unknown as SubscriptionPlanDocument);
    if (!safePlan) {
      throw new AppError('Unable to update subscription plan', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safePlan;
  }

  async deleteById(id: string): Promise<void> {
    const plan = await subscriptionPlanRepository.findById(id);
    if (!plan) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }

    await subscriptionPlanRepository.deleteById(id);
  }

  async list(activeOnly: boolean = false): Promise<SubscriptionPlanResponse[]> {
    const plans = activeOnly
      ? await subscriptionPlanRepository.listActive({})
      : await subscriptionPlanRepository.list({});
    return plans
      .map((plan) => sanitizeSubscriptionPlan(plan as unknown as SubscriptionPlanDocument))
      .filter(Boolean) as SubscriptionPlanResponse[];
  }
}

export const subscriptionPlanService = new SubscriptionPlanService();

