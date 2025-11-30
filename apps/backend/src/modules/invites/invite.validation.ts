import { z } from 'zod';

/**
 * Get invite validation schema
 */
export const getInviteSchema = z.object({
  params: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
  }),
});

/**
 * Track open validation schema
 */
export const trackOpenSchema = z.object({
  params: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
  }),
});

/**
 * Track click validation schema
 */
export const trackClickSchema = z.object({
  params: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
  }),
});

/**
 * Submit RSVP validation schema
 */
export const submitRSVPSchema = z.object({
  params: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'declined'], {
      message: 'Status must be one of: pending, confirmed, declined',
    }),
    message: z.string().max(1000, { message: 'Message must not exceed 1000 characters' }).optional(),
  }),
});

/**
 * Regenerate token validation schema
 */
export const regenerateTokenSchema = z.object({
  params: z.object({
    guestId: z.string().min(1, { message: 'Guest ID is required' }),
  }),
});

