import { z } from 'zod';
import { OAUTH_PROVIDERS } from '../users/user.types';

const REGISTRABLE_ROLES = ['user'] as const;
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    role: z.enum(REGISTRABLE_ROLES).default('user').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
});

export const verifyTwoFactorLoginSchema = z.object({
  body: z.object({
    token: z.string().length(6, 'Token must be 6 digits'),
  }),
});

export const verifyTwoFactorSetupSchema = z.object({
  body: z.object({
    token: z.string().length(6, 'Token must be 6 digits'),
  }),
});

export const disableTwoFactorSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password is required'),
  }),
});

export const providerLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    name: z.string().min(1, 'Name is required'),
    provider: z.enum(OAUTH_PROVIDERS),
    providerId: z.string().min(1, 'Provider ID is required'),
    accessToken: z.string().min(1, 'Access token is required'),
    avatar: z.string().url().optional(),
  }),
});

