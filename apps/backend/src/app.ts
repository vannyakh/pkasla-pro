import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { apiRouter } from './routes';
import { notFoundHandler } from './common/middlewares/not-found-handler';
import { errorHandler } from './common/middlewares/error-handler';
import { checkMaintenanceMode } from './common/middlewares/check-settings';
import { generalRateLimiter } from './common/middlewares/rate-limit';
import { sessionConfig } from './config/session';
import { env } from './config/environment';
import type { Application } from 'express';

export const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);
  
  // Configure CORS first
  const corsOptions = {
    credentials: true,
    origin: (() => {
      // If CORS_ORIGIN is explicitly set and not wildcard, use it
      if (env.cors.origin && env.cors.origin !== '*') {
        return env.cors.origin;
      }
      // In development, allow any origin (returns the requesting origin)
      if (env.isDevelopment) {
        return true;
      }
      // In production, if no CORS_ORIGIN is set, only allow same-origin
      return false;
    })(),
    exposedHeaders: ['Content-Type', 'Content-Length'],
  };
  app.use(cors(corsOptions));
  
  // Configure Helmet with relaxed settings for static files
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());
  app.use(sessionConfig);

  // Apply rate limiting to all API routes
  app.use('/api/v1', generalRateLimiter);

  // Check maintenance mode for all API routes (admins can bypass)
  app.use('/api/v1', checkMaintenanceMode);

  // Serve static files for local uploads with CORS headers
  if (env.storage.provider === 'local' && env.storage.localPath) {
    app.use('/uploads', (req, res, next) => {
      // Set CORS headers for static files
      const origin = req.headers.origin;
      const corsOrigin = env.cors.origin;
      if (origin && (corsOrigin === '*' || corsOrigin?.includes(origin) || (!corsOrigin && env.isDevelopment))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      next();
    }, express.static(env.storage.localPath));
  }

  app.get('/health', (_req, res) =>
    res.json({
      success: true,
      message: 'OK',
      timestamp: new Date().toISOString(),
    }),
  );

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

