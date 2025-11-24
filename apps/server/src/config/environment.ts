import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envFile = process.env.ENV_FILE ?? path.resolve(process.cwd(), '.env');
dotenv.config({ path: envFile });

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
  isProduction: parsedEnv.data.NODE_ENV === 'production',
} as const;

