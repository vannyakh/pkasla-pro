import { z } from 'zod';

export const createUserSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().min(1, { message: 'Plan ID is required' }),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
    autoRenew: z.boolean().default(true),
  }),
});

export const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Subscription ID is required' }),
  }),
});

export const getUserSubscriptionsSchema = z.object({
  params: z.object({
    userId: z.string().min(1, { message: 'User ID is required' }),
  }),
});

export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>['body'];

