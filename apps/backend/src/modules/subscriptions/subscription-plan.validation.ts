import { z } from 'zod';

export const createSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Plan name is required' }),
    displayName: z.string().min(1, { message: 'Display name is required' }),
    description: z.string().optional(),
    price: z.number().min(0, { message: 'Price must be a positive number' }),
    billingCycle: z.enum(['monthly', 'yearly'], {
      message: 'Billing cycle must be monthly or yearly',
    }),
    maxEvents: z.number().min(0).nullable(),
    features: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
  }),
});

export const updateSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Plan ID is required' }),
  }),
  body: z.object({
    displayName: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    billingCycle: z.enum(['monthly', 'yearly']).optional(),
    maxEvents: z.number().min(0).nullable().optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Plan ID is required' }),
  }),
});

export const deleteSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Plan ID is required' }),
  }),
});

export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>['body'];
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>['body'];

