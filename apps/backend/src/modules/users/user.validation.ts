import { z } from 'zod';

// Phone number regex pattern (supports international formats)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z
      .string()
      .refine(
        (val) => {
          if (!val) return true; // Allow empty string to clear phone
          const normalized = val.replace(/[\s\-\(\)]/g, '');
          return phoneRegex.test(normalized);
        },
        { message: 'Must be a valid phone number' },
      )
      .optional(),
  }),
});

