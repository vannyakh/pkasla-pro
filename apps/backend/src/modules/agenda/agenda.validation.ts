import { z } from 'zod';

/**
 * Date validation regex: YYYY-MM-DD
 */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Time validation regex: HH:mm (24-hour format)
 */
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Create agenda item validation schema
 */
export const createAgendaItemSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, { message: 'Event ID is required' }),
    date: z
      .string()
      .min(1, { message: 'Date is required' })
      .regex(dateRegex, { message: 'Date must be in YYYY-MM-DD format' }),
    time: z
      .string()
      .min(1, { message: 'Time is required' })
      .regex(timeRegex, { message: 'Time must be in HH:mm format (24-hour)' }),
    description: z
      .string()
      .max(1000, { message: 'Description must not exceed 1000 characters' })
      .trim()
      .optional(),
  }),
});

/**
 * Update agenda item validation schema
 */
export const updateAgendaItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Agenda item ID is required' }),
  }),
  body: z.object({
    date: z
      .string()
      .regex(dateRegex, { message: 'Date must be in YYYY-MM-DD format' })
      .optional(),
    time: z
      .string()
      .regex(timeRegex, { message: 'Time must be in HH:mm format (24-hour)' })
      .optional(),
    description: z
      .string()
      .max(1000, { message: 'Description must not exceed 1000 characters' })
      .trim()
      .optional(),
  }),
});

/**
 * Get agenda item by ID validation schema
 */
export const getAgendaItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Agenda item ID is required' }),
  }),
});

/**
 * Delete agenda item validation schema
 */
export const deleteAgendaItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Agenda item ID is required' }),
  }),
});

/**
 * Get agenda items by event ID validation schema
 */
export const getAgendaItemsByEventSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, { message: 'Event ID is required' }),
  }),
});

/**
 * Type inference for create agenda item input
 */
export type CreateAgendaItemInput = z.infer<typeof createAgendaItemSchema>['body'];

/**
 * Type inference for update agenda item input
 */
export type UpdateAgendaItemInput = z.infer<typeof updateAgendaItemSchema>['body'];

