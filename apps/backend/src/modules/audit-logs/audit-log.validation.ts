import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Number(val) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Number(val) : 20)),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  action: z.enum([
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'view',
    'export',
    'import',
    'approve',
    'reject',
    'publish',
    'unpublish',
    'payment',
    'subscription',
    'other',
  ]).optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  status: z.enum(['success', 'failure', 'pending']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export const getUserAuditLogsQuerySchema = z.object({
  limit: z.string().optional().transform((val) => (val ? Number(val) : 50)),
});

export const getResourceAuditLogsQuerySchema = z.object({
  limit: z.string().optional().transform((val) => (val ? Number(val) : 50)),
});

