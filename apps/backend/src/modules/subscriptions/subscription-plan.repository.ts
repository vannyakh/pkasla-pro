import type { FilterQuery, UpdateQuery } from 'mongoose';
import { SubscriptionPlanModel, type SubscriptionPlanDocument } from './subscription-plan.model';

export class SubscriptionPlanRepository {
  create(payload: Partial<SubscriptionPlanDocument>) {
    return SubscriptionPlanModel.create(payload);
  }

  findById(id: string) {
    return SubscriptionPlanModel.findById(id).lean();
  }

  findByName(name: string) {
    return SubscriptionPlanModel.findOne({ name: name.toLowerCase() }).lean();
  }

  updateById(id: string, payload: UpdateQuery<SubscriptionPlanDocument>) {
    return SubscriptionPlanModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  deleteById(id: string) {
    return SubscriptionPlanModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<SubscriptionPlanDocument> = {}) {
    return SubscriptionPlanModel.find(filter).sort({ price: 1 }).lean();
  }

  listActive(filter: FilterQuery<SubscriptionPlanDocument> = {}) {
    return SubscriptionPlanModel.find({ ...filter, isActive: true }).sort({ price: 1 }).lean();
  }

  countDocuments(filter: FilterQuery<SubscriptionPlanDocument> = {}) {
    return SubscriptionPlanModel.countDocuments(filter);
  }
}

export const subscriptionPlanRepository = new SubscriptionPlanRepository();

