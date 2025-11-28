import { z } from 'zod';

const guestStatusEnum = z.enum(['pending', 'confirmed', 'declined']);

/**
 * Create guest validation schema
 */
export const createGuestSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .max(200, { message: 'Name must not exceed 200 characters' })
      .trim(),
    email: z
      .string()
      .email({ message: 'Email must be a valid email address' })
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(20, { message: 'Phone must not exceed 20 characters' })
      .trim()
      .optional()
      .or(z.literal('')),
    eventId: z.string().min(1, { message: 'Event ID is required' }),
    userId: z.string().optional(),
    occupation: z
      .string()
      .max(200, { message: 'Occupation must not exceed 200 characters' })
      .trim()
      .optional(),
    notes: z
      .string()
      .max(1000, { message: 'Notes must not exceed 1000 characters' })
      .trim()
      .optional(),
    tag: z
      .string()
      .max(50, { message: 'Tag must not exceed 50 characters' })
      .trim()
      .optional(),
    address: z
      .string()
      .max(500, { message: 'Address must not exceed 500 characters' })
      .trim()
      .optional(),
    province: z
      .string()
      .max(100, { message: 'Province must not exceed 100 characters' })
      .trim()
      .optional(),
    photo: z
      .string()
      .url({ message: 'Photo must be a valid URL' })
      .optional()
      .or(z.literal('')),
    hasGivenGift: z.boolean().optional().default(false),
    status: guestStatusEnum.optional().default('pending'),
  }),
});

/**
 * Update guest validation schema
 */
export const updateGuestSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Guest ID is required' }),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, { message: 'Name cannot be empty' })
      .max(200, { message: 'Name must not exceed 200 characters' })
      .trim()
      .optional(),
    email: z
      .string()
      .email({ message: 'Email must be a valid email address' })
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(20, { message: 'Phone must not exceed 20 characters' })
      .trim()
      .optional()
      .or(z.literal('')),
    occupation: z
      .string()
      .max(200, { message: 'Occupation must not exceed 200 characters' })
      .trim()
      .optional(),
    notes: z
      .string()
      .max(1000, { message: 'Notes must not exceed 1000 characters' })
      .trim()
      .optional(),
    tag: z
      .string()
      .max(50, { message: 'Tag must not exceed 50 characters' })
      .trim()
      .optional(),
    address: z
      .string()
      .max(500, { message: 'Address must not exceed 500 characters' })
      .trim()
      .optional(),
    province: z
      .string()
      .max(100, { message: 'Province must not exceed 100 characters' })
      .trim()
      .optional(),
    photo: z
      .string()
      .url({ message: 'Photo must be a valid URL' })
      .optional()
      .or(z.literal('')),
    hasGivenGift: z.boolean().optional(),
    status: guestStatusEnum.optional(),
  }),
});

/**
 * Get guest by ID validation schema
 */
export const getGuestSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Guest ID is required' }),
  }),
});

/**
 * Delete guest validation schema
 */
export const deleteGuestSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Guest ID is required' }),
  }),
});

/**
 * List guests query validation schema
 */
export const listGuestsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
    eventId: z.string().optional(),
    userId: z.string().optional(),
    status: guestStatusEnum.optional(),
    search: z.string().optional(),
  }),
});

/**
 * Type inference for create guest input
 */
export type CreateGuestInput = z.infer<typeof createGuestSchema>['body'];

/**
 * Type inference for update guest input
 */
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>['body'];

/**
 * Type inference for list guests query
 */
export type ListGuestsQuery = z.infer<typeof listGuestsQuerySchema>['query'];

