import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { apiRouter } from './routes';
import { notFoundHandler } from './common/middlewares/not-found-handler';
import { errorHandler } from './common/middlewares/error-handler';
import { checkMaintenanceMode } from './common/middlewares/check-settings';
import { sessionConfig } from './config/session';
import { env } from './config/environment';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  
  // Configure CORS first
  const corsOptions = {
    credentials: true,
    origin: process.env.CORS_ORIGIN || true,
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
  app.use(compression());
  app.use(sessionConfig);

  // Check maintenance mode for all API routes (admins can bypass)
  app.use('/api/v1', checkMaintenanceMode);

  // Serve static files for local uploads with CORS headers
  if (env.storage.provider === 'local' && env.storage.localPath) {
    app.use('/uploads', (req, res, next) => {
      // Set CORS headers for static files
      const origin = req.headers.origin;
      if (origin && (process.env.CORS_ORIGIN === '*' || process.env.CORS_ORIGIN?.includes(origin) || !process.env.CORS_ORIGIN)) {
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

