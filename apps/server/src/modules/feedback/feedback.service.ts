import httpStatus from 'http-status';
import type { z } from 'zod';
import { AppError } from '@/common/errors/app-error';
import { feedbackRepository } from './feedback.repository';
import { feedbackFinderService, type FeedbackFinderQuery } from './feedback.finder';
import { createFeedbackSchema, updateFeedbackSchema, respondToFeedbackSchema } from './feedback.validation';
import type { FeedbackStatus } from './feedback.model';

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>['body'];
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>['body'];
export type RespondToFeedbackInput = z.infer<typeof respondToFeedbackSchema>['body'];

class FeedbackService {
  async create(payload: CreateFeedbackInput, userId: string) {
    return feedbackRepository.create({
      ...payload,
      userId: userId as any,
    });
  }

  async findById(id: string) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new AppError('Feedback not found', httpStatus.NOT_FOUND);
    }
    return feedback;
  }

  async update(id: string, payload: UpdateFeedbackInput) {
    const feedback = await feedbackRepository.updateById(id, payload);
    if (!feedback) {
      throw new AppError('Feedback not found', httpStatus.NOT_FOUND);
    }
    return feedback;
  }

  async respondToFeedback(id: string, payload: RespondToFeedbackInput, adminId: string) {
    const feedback = await this.findById(id);
    
    const updateData: any = {
      adminResponse: payload.adminResponse,
      respondedBy: adminId as any,
      respondedAt: new Date(),
    };

    if (payload.status) {
      updateData.status = payload.status;
    } else if (feedback.status === 'pending') {
      // Auto-update to in_progress if responding to pending feedback
      updateData.status = 'in_progress';
    }

    const updated = await feedbackRepository.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Feedback not found', httpStatus.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string) {
    const feedback = await feedbackRepository.deleteById(id);
    if (!feedback) {
      throw new AppError('Feedback not found', httpStatus.NOT_FOUND);
    }
    return feedback;
  }

  list(query: FeedbackFinderQuery) {
    return feedbackFinderService.execute(query);
  }

  async findByUserId(userId: string, query: FeedbackFinderQuery = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      feedbackRepository.findByUserId(userId, {}, { limit, skip }),
      feedbackRepository.count({ userId }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateStatus(id: string, status: FeedbackStatus) {
    return this.update(id, { status });
  }
}

export const feedbackService = new FeedbackService();

