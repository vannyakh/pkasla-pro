import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Determine NODE_ENV first (before loading env files)
const nodeEnv = process.env.NODE_ENV || 'development';

// Load environment-specific .env file
// Priority: ENV_FILE > .env.{NODE_ENV} > .env
const cwd = process.cwd();
let envFile = process.env.ENV_FILE;

if (!envFile) {
  const envSpecificFile = path.resolve(cwd, `.env.${nodeEnv}`);
  const defaultFile = path.resolve(cwd, '.env');
  
  // Try to load environment-specific file first, fallback to .env
  try {
    if (fs.existsSync(envSpecificFile)) {
      envFile = envSpecificFile;
    } else {
      envFile = defaultFile;
    }
  } catch {
    envFile = defaultFile;
  }
}

// Load the determined .env file
dotenv.config({ path: envFile });

// Also load .env.local if it exists (for local overrides, should be in .gitignore)
const localEnvFile = path.resolve(cwd, '.env.local');
dotenv.config({ path: localEnvFile, override: false });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 4000)),
  MONGODB_URI: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(10, 'JWT_ACCESS_SECRET must be at least 10 characters')
    .default('change-me-access'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10, 'JWT_REFRESH_SECRET must be at least 10 characters')
    .default('change-me-refresh'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters')
    .default('change-me-session-secret-min-32-chars'),
  // Storage configuration
  STORAGE_PROVIDER: z.enum(['local', 'r2']).default('local'),
  STORAGE_LOCAL_PATH: z.string().optional(),
  // R2 Configuration
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional().or(z.literal('')),
  // Redis Configuration
  REDIS_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 6379)),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 0)),
  REDIS_TTL: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 3600)), // Default 1 hour
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  // Bakong KHQR Configuration
  BAKONG_API_URL: z.string().url().optional(),
  BAKONG_ACCESS_TOKEN: z.string().optional(),
  BAKONG_MERCHANT_ACCOUNT_ID: z.string().optional(),
  BAKONG_WEBHOOK_SECRET: z.string().optional(),
  BAKONG_ENVIRONMENT: z.enum(['sit', 'production']).default('sit'),
  // Telegram Bot Configuration (Optional - can be configured via settings UI)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  // API Configuration
  API_BASE_URL: z.string().url().optional(),
  API_URL: z.string().url().optional(), // Alias for API_BASE_URL
  // CORS Configuration
  CORS_ORIGIN: z.string().optional(), // Comma-separated list of allowed origins, or '*' for all, or leave empty for same-origin
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 900000)), // Default 15 minutes
  RATE_LIMIT_MAX: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 100)), // Default 100 requests
  RATE_LIMIT_AUTH_WINDOW_MS: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 900000)), // Default 15 minutes
  RATE_LIMIT_AUTH_MAX: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 5)), // Default 5 requests
  RATE_LIMIT_UPLOAD_WINDOW_MS: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 900000)), // Default 15 minutes
  RATE_LIMIT_UPLOAD_MAX: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 20)), // Default 20 requests
  RATE_LIMIT_WEBHOOK_WINDOW_MS: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 60000)), // Default 1 minute
  RATE_LIMIT_WEBHOOK_MAX: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 100)), // Default 100 requests
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Environment validation error: ${parsedEnv.error.message}`);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  mongoUri: parsedEnv.data.MONGODB_URI ?? 'mongodb://localhost:27017/somborkjobs',
  logLevel: parsedEnv.data.LOG_LEVEL,
  jwt: {
    accessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
    accessExpiresIn: parsedEnv.data.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
    refreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
  },
  session: {
    secret: parsedEnv.data.SESSION_SECRET,
  },
  storage: {
    provider: parsedEnv.data.STORAGE_PROVIDER,
    localPath: parsedEnv.data.STORAGE_LOCAL_PATH,
    r2: parsedEnv.data.STORAGE_PROVIDER === 'r2' && parsedEnv.data.R2_ACCOUNT_ID
      ? {
          accountId: parsedEnv.data.R2_ACCOUNT_ID,
          accessKeyId: parsedEnv.data.R2_ACCESS_KEY_ID!,
          secretAccessKey: parsedEnv.data.R2_SECRET_ACCESS_KEY!,
          bucketName: parsedEnv.data.R2_BUCKET_NAME!,
          publicUrl: parsedEnv.data.R2_PUBLIC_URL || undefined,
        }
      : undefined,
  },
  redis: {
    enabled: parsedEnv.data.REDIS_ENABLED ?? false,
    host: parsedEnv.data.REDIS_HOST,
    port: parsedEnv.data.REDIS_PORT,
    password: parsedEnv.data.REDIS_PASSWORD,
    db: parsedEnv.data.REDIS_DB,
    ttl: parsedEnv.data.REDIS_TTL,
  },
  stripe: parsedEnv.data.STRIPE_SECRET_KEY
    ? {
        secretKey: parsedEnv.data.STRIPE_SECRET_KEY,
        webhookSecret: parsedEnv.data.STRIPE_WEBHOOK_SECRET,
        publishableKey: parsedEnv.data.STRIPE_PUBLISHABLE_KEY,
      }
    : undefined,
  bakong: parsedEnv.data.BAKONG_ACCESS_TOKEN
    ? {
        apiUrl: parsedEnv.data.BAKONG_API_URL || 
          (parsedEnv.data.BAKONG_ENVIRONMENT === 'production'
            ? 'https://api-bakong.nbc.gov.kh'
            : 'https://sit-api-bakong.nbc.gov.kh'),
        accessToken: parsedEnv.data.BAKONG_ACCESS_TOKEN,
        merchantAccountId: parsedEnv.data.BAKONG_MERCHANT_ACCOUNT_ID,
        webhookSecret: parsedEnv.data.BAKONG_WEBHOOK_SECRET,
        environment: parsedEnv.data.BAKONG_ENVIRONMENT,
      }
    : undefined,
  telegram: parsedEnv.data.TELEGRAM_BOT_TOKEN
    ? {
        botToken: parsedEnv.data.TELEGRAM_BOT_TOKEN,
        chatId: parsedEnv.data.TELEGRAM_CHAT_ID,
      }
    : undefined,
  api: {
    baseUrl: parsedEnv.data.API_BASE_URL || parsedEnv.data.API_URL || 
      (parsedEnv.data.NODE_ENV === 'production' 
        ? `https://api.phkasla.com` 
        : `http://localhost:${parsedEnv.data.PORT || 4000}`),
  },
  cors: {
    // Parse CORS_ORIGIN: if it contains commas, split into array; if '*', keep as string; if empty, use undefined
    origin: parsedEnv.data.CORS_ORIGIN 
      ? (parsedEnv.data.CORS_ORIGIN === '*' 
          ? parsedEnv.data.CORS_ORIGIN 
          : parsedEnv.data.CORS_ORIGIN.split(',').map(o => o.trim()))
      : undefined,
  },
  rateLimit: {
    windowMs: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
    max: parsedEnv.data.RATE_LIMIT_MAX,
    authWindowMs: parsedEnv.data.RATE_LIMIT_AUTH_WINDOW_MS,
    authMax: parsedEnv.data.RATE_LIMIT_AUTH_MAX,
    uploadWindowMs: parsedEnv.data.RATE_LIMIT_UPLOAD_WINDOW_MS,
    uploadMax: parsedEnv.data.RATE_LIMIT_UPLOAD_MAX,
    webhookWindowMs: parsedEnv.data.RATE_LIMIT_WEBHOOK_WINDOW_MS,
    webhookMax: parsedEnv.data.RATE_LIMIT_WEBHOOK_MAX,
  },
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
} as const;

