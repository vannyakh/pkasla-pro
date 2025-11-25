import { z } from 'zod';

const salarySchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().positive(),
    currency: z.string().min(1),
  })
  .refine((val) => val.max >= val.min, { message: 'Max salary must be >= min salary' });

const baseJobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  description: z.string().min(20),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).default('full_time'),
  location: z.string().min(2),
  isRemote: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  salaryRange: salarySchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  expiresAt: z.coerce.date().optional(),
});

export const createJobSchema = z.object({
  body: baseJobSchema,
});

export const updateJobSchema = z.object({
  body: baseJobSchema.partial(),
});

export const jobQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    sortBy: z
      .enum([
        'newest_first',
        'oldest_first',
        'salary_high_to_low',
        'salary_low_to_high',
        'company_a_to_z',
        'company_z_to_a',
        'title_a_to_z',
        'title_z_to_a',
      ])
      .optional(),
    // Keep legacy sort/order for backward compatibility
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    keyword: z.string().optional(),
    location: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
    isRemote: z
      .union([z.string(), z.boolean()])
      .optional()
      .transform((value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true';
        return undefined;
      }),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const savedJobsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
  }),
});

