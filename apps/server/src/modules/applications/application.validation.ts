import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().min(1),
    coverLetter: z.string().max(5000).optional(),
    resumeUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    linkedInUrl: z.string().url().optional(),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn']).optional(),
    coverLetter: z.string().max(5000).optional(),
    resumeUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    linkedInUrl: z.string().url().optional(),
    notes: z.string().max(2000).optional(),
  }),
});

export const applicationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    status: z.enum(['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn']).optional(),
  }),
});

