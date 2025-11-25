import { z } from 'zod';

const baseFeedbackSchema = z.object({
  type: z.enum(['feedback', 'complaint']),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium').optional(),
});

export const createFeedbackSchema = z.object({
  body: baseFeedbackSchema,
});

export const updateFeedbackSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    adminResponse: z.string().max(5000).optional(),
  }),
});

export const feedbackQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    type: z.enum(['feedback', 'complaint']).optional(),
    status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    userId: z.string().optional(),
    keyword: z.string().optional(),
  }),
});

export const respondToFeedbackSchema = z.object({
  body: z.object({
    adminResponse: z.string().min(1).max(5000),
    status: z.enum(['in_progress', 'resolved', 'closed']).optional(),
  }),
});

