import { z } from 'zod';
import { OAUTH_PROVIDERS } from '../users/user.types';

const REGISTRABLE_ROLES = ['job_seeker', 'employees'] as const;
export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    role: z.enum(REGISTRABLE_ROLES).default('job_seeker').optional(),
  }),
});

// Phone number regex pattern (supports international formats)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const loginSchema = z.object({
  body: z.object({
    emailOrPhone: z
      .string()
      .min(1)
      .refine(
        (val) => {
          // Check if it's a valid email or phone number
          const isEmail = z.string().email().safeParse(val).success;
          const isPhone = phoneRegex.test(val.replace(/[\s\-\(\)]/g, '')); // Remove common phone formatting
          return isEmail || isPhone;
        },
        { message: 'Must be a valid email address or phone number' },
      ),
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
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    provider: z.enum(OAUTH_PROVIDERS),
    providerId: z.string().min(1, 'Provider ID is required'),
    accessToken: z.string().min(1, 'Access token is required'),
    avatar: z.string().url().optional(),
  }),
});

