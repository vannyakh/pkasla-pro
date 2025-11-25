import { z } from 'zod';

const baseBlogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  content: z.string().min(100),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('draft').optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

export const createBlogSchema = z.object({
  body: baseBlogSchema,
});

export const updateBlogSchema = z.object({
  body: baseBlogSchema.partial(),
});

export const blogQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    authorId: z.string().optional(),
    tag: z.string().optional(),
    keyword: z.string().optional(),
    incrementViews: z.string().optional(),
  }),
});

export const updateBlogStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'published', 'archived']),
  }),
});

