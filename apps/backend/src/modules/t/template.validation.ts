import { z } from 'zod';

/**
 * Create template validation schema
 */
export const createTemplateSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .max(100, { message: 'Name must not exceed 100 characters' })
      .trim()
      .regex(/^[a-z0-9-]+$/, { message: 'Name must contain only lowercase letters, numbers, and hyphens' }),
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(200, { message: 'Title must not exceed 200 characters' })
      .trim(),
    category: z
      .string()
      .max(50, { message: 'Category must not exceed 50 characters' })
      .trim()
      .optional(),
    price: z
      .number()
      .min(0, { message: 'Price must be a positive number' })
      .optional(),
    isPremium: z
      .boolean()
      .optional()
      .default(false),
    previewImage: z
      .union([
        z.string().url({ message: 'Preview image must be a valid URL' }),
        z.string().optional(),
      ])
      .optional(),
  }),
});

/**
 * Update template validation schema
 */
export const updateTemplateSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Template ID is required' }),
  }),
  body: z.object({
    name: z
      .preprocess(
        (val) => (val === '' || val === null ? undefined : val),
        z
          .string()
          .trim()
          .min(1, { message: 'Name cannot be empty' })
          .max(100, { message: 'Name must not exceed 100 characters' })
          .regex(/^[a-z0-9-]+$/, { message: 'Name must contain only lowercase letters, numbers, and hyphens' })
          .optional()
      ),
    title: z
      .preprocess(
        (val) => (val === '' || val === null ? undefined : val),
        z
          .string()
          .trim()
          .min(1, { message: 'Title cannot be empty' })
          .max(200, { message: 'Title must not exceed 200 characters' })
          .optional()
      ),
    category: z
      .preprocess(
        (val) => (val === '' || val === null ? undefined : val),
        z
          .string()
          .trim()
          .max(50, { message: 'Category must not exceed 50 characters' })
          .optional()
      ),
    price: z
      .number()
      .min(0, { message: 'Price must be a positive number' })
      .optional(),
    isPremium: z.boolean().optional(),
    previewImage: z
      .preprocess(
        (val) => (val === '' || val === null ? undefined : val),
        z
          .union([
            z.string().url({ message: 'Preview image must be a valid URL' }),
            z.string().optional(),
          ])
          .optional()
      ),
  }),
});

/**
 * Get template by ID validation schema
 */
export const getTemplateSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Template ID is required' }),
  }),
});

/**
 * Delete template validation schema
 */
export const deleteTemplateSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Template ID is required' }),
  }),
});

/**
 * List templates query validation schema
 */
export const listTemplatesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
    category: z.string().optional(),
    isPremium: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

/**
 * Type inference for create template input
 */
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>['body'];

/**
 * Type inference for update template input
 */
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>['body'];

/**
 * Type inference for list templates query
 */
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>['query'];

