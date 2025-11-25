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
  }),
});

/**
 * Type inference for update profile input
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];

