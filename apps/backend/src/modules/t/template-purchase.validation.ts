import { z } from 'zod';

export const createTemplatePurchaseSchema = z.object({
  body: z.object({
    templateId: z.string().min(1, { message: 'Template ID is required' }),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
  }),
});

export const getTemplatePurchaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Purchase ID is required' }),
  }),
});

export const checkTemplateOwnershipSchema = z.object({
  params: z.object({
    templateId: z.string().min(1, { message: 'Template ID is required' }),
  }),
});

export type CreateTemplatePurchaseInput = z.infer<typeof createTemplatePurchaseSchema>['body'];

