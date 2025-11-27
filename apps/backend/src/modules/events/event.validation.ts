import { z } from 'zod';

const eventTypeEnum = z.enum(['wedding', 'engagement', 'hand-cutting', 'birthday', 'anniversary', 'other']);
const eventStatusEnum = z.enum(['published', 'draft', 'completed', 'cancelled']);

/**
 * Create event validation schema
 */
export const createEventSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(200, { message: 'Title must not exceed 200 characters' })
      .trim(),
    description: z
      .string()
      .max(2000, { message: 'Description must not exceed 2000 characters' })
      .trim()
      .optional(),
    eventType: eventTypeEnum,
    date: z.preprocess(
      (val) => {
        if (val instanceof Date) {
          return val.toISOString();
        }
        if (typeof val === 'string') {
          // If it's a datetime-local format, convert to ISO
          if (val.includes('T') && !val.includes('Z') && !val.includes('+')) {
            return new Date(val).toISOString();
          }
          return val;
        }
        return val;
      },
      z.string().datetime({ message: 'Date must be a valid ISO datetime string' })
    ),
    venue: z
      .string()
      .min(1, { message: 'Venue is required' })
      .max(500, { message: 'Venue must not exceed 500 characters' })
      .trim(),
    googleMapLink: z
      .string()
      .url({ message: 'Google Map link must be a valid URL' })
      .optional()
      .or(z.literal('')),
    coverImage: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'),
        { message: 'Cover image must be a valid URL or relative path starting with /uploads/' }
      )
      .optional()
      .or(z.literal('')),
    khqrUsd: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'),
        { message: 'KHQR USD must be a valid URL or relative path starting with /uploads/' }
      )
      .optional()
      .or(z.literal('')),
    khqrKhr: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'),
        { message: 'KHQR KHR must be a valid URL or relative path starting with /uploads/' }
      )
      .optional()
      .or(z.literal('')),
    restrictDuplicateNames: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          return val === 'true';
        }
        return val;
      },
      z.boolean().optional().default(false)
    ),
    status: eventStatusEnum.optional().default('draft'),
  }),
});

/**
 * Update event validation schema
 */
export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Event ID is required' }),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, { message: 'Title cannot be empty' })
      .max(200, { message: 'Title must not exceed 200 characters' })
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, { message: 'Description must not exceed 2000 characters' })
      .trim()
      .optional(),
    eventType: eventTypeEnum.optional(),
    date: z.preprocess(
      (val) => {
        if (val instanceof Date) {
          return val.toISOString();
        }
        if (typeof val === 'string') {
          // If it's a datetime-local format, convert to ISO
          if (val.includes('T') && !val.includes('Z') && !val.includes('+')) {
            return new Date(val).toISOString();
          }
          return val;
        }
        return val;
      },
      z.string().datetime({ message: 'Date must be a valid ISO datetime string' }).optional()
    ),
    venue: z
      .string()
      .min(1, { message: 'Venue cannot be empty' })
      .max(500, { message: 'Venue must not exceed 500 characters' })
      .trim()
      .optional(),
    googleMapLink: z
      .string()
      .url({ message: 'Google Map link must be a valid URL' })
      .optional()
      .or(z.literal('')),
    coverImage: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'),
        { message: 'Cover image must be a valid URL or relative path starting with /uploads/' }
      )
      .optional()
      .or(z.literal('')),
    khqrUsd: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'),
        { message: 'KHQR USD must be a valid URL or relative path starting with /uploads/' }
      )
      .optional()
      .or(z.literal('')),
    khqrKhr: z
      .string()
      .refine(
        (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'),
        { message: 'KHQR KHR must be a valid URL or relative path starting with /uploads/' }
      )
      .optional()
      .or(z.literal('')),
    restrictDuplicateNames: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          return val === 'true';
        }
        return val;
      },
      z.boolean().optional()
    ),
    status: eventStatusEnum.optional(),
  }),
});

/**
 * Get event by ID validation schema
 */
export const getEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Event ID is required' }),
  }),
});

/**
 * Delete event validation schema
 */
export const deleteEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Event ID is required' }),
  }),
});

/**
 * List events query validation schema
 */
export const listEventsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
    hostId: z.string().optional(),
    status: eventStatusEnum.optional(),
    eventType: eventTypeEnum.optional(),
    search: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

/**
 * Type inference for create event input
 */
export type CreateEventInput = z.infer<typeof createEventSchema>['body'];

/**
 * Type inference for update event input
 */
export type UpdateEventInput = z.infer<typeof updateEventSchema>['body'];

/**
 * Type inference for list events query
 */
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>['query'];

