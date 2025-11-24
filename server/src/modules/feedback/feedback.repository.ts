import type { FilterQuery, UpdateQuery } from 'mongoose';
import { FeedbackModel, type FeedbackDocument } from './feedback.model';

export class FeedbackRepository {
  create(payload: Partial<FeedbackDocument>) {
    return FeedbackModel.create(payload);
  }

  findById(id: string) {
    return FeedbackModel.findById(id).populate('userId', 'firstName lastName email').populate('respondedBy', 'firstName lastName email').lean();
  }

  findByUserId(userId: string, filter: FilterQuery<FeedbackDocument> = {}, options?: { limit?: number; skip?: number }) {
    const query = FeedbackModel.find({ userId, ...filter })
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'firstName lastName email');
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    
    return query.lean();
  }

  updateById(id: string, payload: UpdateQuery<FeedbackDocument>) {
    return FeedbackModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('userId', 'firstName lastName email')
      .populate('respondedBy', 'firstName lastName email')
      .lean();
  }

  deleteById(id: string) {
    return FeedbackModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<FeedbackDocument> = {}) {
    return FeedbackModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('respondedBy', 'firstName lastName email')
      .lean();
  }

  count(filter: FilterQuery<FeedbackDocument> = {}) {
    return FeedbackModel.countDocuments(filter);
  }
}

export const feedbackRepository = new FeedbackRepository();

