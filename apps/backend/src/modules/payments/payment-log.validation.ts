import { z } from 'zod';

export const listPaymentLogsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    userId: z.string().optional(),
    transactionId: z.string().optional(),
    paymentMethod: z.enum(['stripe', 'bakong']).optional(),
    paymentType: z.enum(['subscription', 'template']).optional(),
    eventType: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'expired', 'cancelled']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
  }),
});

export const getPaymentLogParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment log ID is required'),
  }),
});

export const getPaymentLogStatsQuerySchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    transactionId: z.string().optional(),
    paymentMethod: z.enum(['stripe', 'bakong']).optional(),
    paymentType: z.enum(['subscription', 'template']).optional(),
    eventType: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'expired', 'cancelled']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

