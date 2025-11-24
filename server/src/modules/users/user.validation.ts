import { z } from 'zod';

// Phone number regex pattern (supports international formats)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
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
    profile: z
      .object({
        title: z.string().max(100).optional(),
        bio: z.string().max(1000).optional(),
        location: z.string().max(200).optional(),
        website: z
          .string()
          .url('Must be a valid URL')
          .optional()
          .or(z.literal('')),
        avatarUrl: z
          .string()
          .url('Must be a valid URL')
          .optional()
          .or(z.literal('')),
        company: z.string().max(200).optional(),
      })
      .partial()
      .optional(),
  }),
});

