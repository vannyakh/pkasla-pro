import type { FilterQuery } from 'mongoose';
import { FinderService, type PaginationQuery } from '@/common/services/finder.service';
import { FeedbackModel, type FeedbackDocument, type FeedbackType, type FeedbackStatus, type FeedbackPriority } from './feedback.model';

export interface FeedbackFinderQuery extends PaginationQuery, Record<string, unknown> {
  type?: FeedbackType;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  userId?: string;
  keyword?: string;
}

class FeedbackFinderService extends FinderService<FeedbackDocument> {
  constructor() {
    super(FeedbackModel);
  }

  protected buildFilter(query: FeedbackFinderQuery): FilterQuery<FeedbackDocument> {
    const filter: FilterQuery<FeedbackDocument> = {};

    if (query.type) {
      filter.type = query.type;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.keyword) {
      filter.$or = [
        { subject: { $regex: query.keyword, $options: 'i' } },
        { message: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    return filter;
  }

  async execute(query: FeedbackFinderQuery) {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', ...rest } = query;
    const filter = this.buildFilter(rest);

    const [data, total] = await Promise.all([
      FeedbackModel.find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .populate('respondedBy', 'firstName lastName email')
        .lean()
        .exec(),
      FeedbackModel.countDocuments(filter),
    ]);

    return {
      data: data as any,
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

export const feedbackFinderService = new FeedbackFinderService();

