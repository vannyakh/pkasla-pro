import { z } from 'zod';

const paymentMethodEnum = z.enum(['cash', 'khqr']);
const currencyEnum = z.enum(['khr', 'usd']);

/**
 * Create gift validation schema
 */
export const createGiftSchema = z.object({
  body: z.object({
    guestId: z.string().min(1, { message: 'Guest ID is required' }),
    paymentMethod: paymentMethodEnum,
    currency: currencyEnum,
    amount: z
      .number()
      .positive({ message: 'Amount must be greater than 0' })
      .or(z.string().transform((val) => parseFloat(val)))
      .pipe(z.number().positive()),
    note: z.string().max(1000, { message: 'Note must not exceed 1000 characters' }).trim().optional(),
    receiptImage: z.string().url({ message: 'Receipt image must be a valid URL' }).optional().or(z.literal('')),
  }),
});

/**
 * Update gift validation schema
 */
export const updateGiftSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Gift ID is required' }),
  }),
  body: z.object({
    paymentMethod: paymentMethodEnum.optional(),
    currency: currencyEnum.optional(),
    amount: z
      .number()
      .positive({ message: 'Amount must be greater than 0' })
      .optional()
      .or(z.string().transform((val) => parseFloat(val)).optional())
      .pipe(z.number().positive().optional()),
    note: z.string().max(1000, { message: 'Note must not exceed 1000 characters' }).trim().optional(),
    receiptImage: z.string().url({ message: 'Receipt image must be a valid URL' }).optional().or(z.literal('')),
  }),
});

/**
 * Get gift by ID validation schema
 */
export const getGiftSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Gift ID is required' }),
  }),
});

/**
 * Delete gift validation schema
 */
export const deleteGiftSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Gift ID is required' }),
  }),
});

/**
 * List gifts query validation schema
 */
export const listGiftsQuerySchema = z.object({
  query: z.object({
    guestId: z.string().optional(),
    eventId: z.string().optional(),
    paymentMethod: paymentMethodEnum.optional(),
    currency: currencyEnum.optional(),
    page: z.coerce.number().min(1).default(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
  }),
});

/**
 * Type inference for create gift input
 */
export type CreateGiftInput = z.infer<typeof createGiftSchema>['body'];

/**
 * Type inference for update gift input
 */
export type UpdateGiftInput = z.infer<typeof updateGiftSchema>['body'];

