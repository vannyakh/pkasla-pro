import { z } from 'zod';

export const approveJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const rejectJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const approveCompanySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const rejectCompanySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['active', 'pending', 'suspended']),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(['admin', 'recruiter', 'candidate']),
  }),
});

export const adminQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    role: z.string().optional(),
    status: z.string().optional(),
    approvalStatus: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

