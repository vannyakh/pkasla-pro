import { z } from 'zod';

// Phone number regex pattern (supports international formats)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

/**
 * Profile update validation schema
 * Allows updating name and phone number
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(100, { message: 'Name must not exceed 100 characters' })
      .trim()
      .optional(),
    phone: z
      .string()
      .trim()
      .refine(
        (val) => {
          // Allow empty string to clear phone number
          if (!val || val === '') return true;
          // Normalize phone number by removing common formatting characters
          const normalized = val.replace(/[\s\-\(\)\.]/g, '');
          // Validate against international phone format
          return phoneRegex.test(normalized);
        },
        { message: 'Must be a valid phone number (international format: +1234567890)' },
      )
      .optional()
      .transform((val) => (val === '' ? null : val)), // Convert empty string to null, keep undefined as-is
    avatar: z
      .string()
      .url({ message: 'Avatar must be a valid URL' })
      .optional()
      .transform((val) => (val === '' ? null : val)), // Convert empty string to null
  }),
});

/**
 * Type inference for update profile input
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];

/**
 * List users query validation schema
 */
export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
  }),
});

/**
 * Type inference for list users query
 */
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>['query'];

/**
 * Telegram integration validation schema
 */
export const updateTelegramSchema = z.object({
  body: z.object({
    telegramChatId: z
      .string()
      .trim()
      .min(1, { message: 'Telegram Chat ID is required' })
      .regex(/^-?\d+$/, { message: 'Telegram Chat ID must be a valid number' }),
    isTelegramBot: z.boolean().default(true),
  }),
});

/**
 * Type inference for Telegram update input
 */
export type UpdateTelegramInput = z.infer<typeof updateTelegramSchema>['body'];

