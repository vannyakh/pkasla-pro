import { rateLimit } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';

// Extend Express Request type to include rateLimit property added by express-rate-limit
declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date;
    };
  }
}

/**
 * Custom key generator that uses IP address and optionally user ID
 */
const keyGenerator = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // Get IP from various sources (considering proxies)
  const ip = 
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown';
  
  return `ip:${typeof ip === 'string' ? ip.split(',')[0].trim() : ip}`;
};

/**
 * Custom handler for when rate limit is exceeded
 */
const handler = (req: Request, res: Response) => {
  logger.warn({
    key: keyGenerator(req),
    path: req.path,
    method: req.method,
  }, 'Rate limit exceeded');

  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: req.rateLimit?.resetTime,
  });
};

/**
 * Skip rate limiting based on conditions
 */
const skip = (req: Request): boolean => {
  // Skip rate limiting in test environment
  if (env.nodeEnv === 'test') {
    return true;
  }

  // Skip rate limiting for health check endpoints
  if (req.path === '/health' || req.path === '/api/v1/health') {
    return true;
  }

  // Optionally skip for admin users (uncomment if needed)
  // if (req.user?.role === 'admin') {
  //   return true;
  // }

  return false;
};

/**
 * General rate limiter for all API routes
 * Default: 100 requests per 15 minutes per IP/user
 */
export const generalRateLimiter = rateLimit({
  windowMs: env.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes
  max: env.rateLimit?.max || 100, // Limit each IP/user to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator,
  handler,
  skip,
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Strict rate limiter for authentication routes (login, register, etc.)
 * Default: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit?.authWindowMs || 15 * 60 * 1000, // 15 minutes
  max: env.rateLimit?.authMax || 5, // Limit each IP to 5 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // For auth routes, always use IP (not user ID since they're not authenticated yet)
    const ip = 
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'unknown';
    
    return `auth-ip:${typeof ip === 'string' ? ip.split(',')[0].trim() : ip}`;
  },
  handler,
  skip: (req: Request): boolean => {
    return env.nodeEnv === 'test';
  },
  message: 'Too many authentication attempts, please try again later.',
});

/**
 * Upload rate limiter for file upload routes
 * Default: 20 requests per 15 minutes per IP/user
 */
export const uploadRateLimiter = rateLimit({
  windowMs: env.rateLimit?.uploadWindowMs || 15 * 60 * 1000, // 15 minutes
  max: env.rateLimit?.uploadMax || 20, // Limit each IP/user to 20 uploads per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
  skip,
  message: 'Too many upload requests, please try again later.',
});

/**
 * Webhook rate limiter for webhook endpoints
 * Default: 100 requests per minute per IP
 */
export const webhookRateLimiter = rateLimit({
  windowMs: env.rateLimit?.webhookWindowMs || 60 * 1000, // 1 minute
  max: env.rateLimit?.webhookMax || 100, // Limit each IP to 100 webhook requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const ip = 
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'unknown';
    
    return `webhook-ip:${typeof ip === 'string' ? ip.split(',')[0].trim() : ip}`;
  },
  handler,
  skip: (req: Request): boolean => {
    return env.nodeEnv === 'test';
  },
  message: 'Too many webhook requests, please try again later.',
});

/**
 * Create a custom rate limiter with specific options
 */
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipAuthenticated?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: (req: Request): boolean => {
      if (env.nodeEnv === 'test') {
        return true;
      }
      if (options.skipAuthenticated && req.user) {
        return true;
      }
      return false;
    },
    message: options.message || 'Too many requests, please try again later.',
  });
};

