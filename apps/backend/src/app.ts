import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { apiRouter } from './routes';
import { notFoundHandler } from './common/middlewares/not-found-handler';
import { errorHandler } from './common/middlewares/error-handler';
import { sessionConfig } from './config/session';
import { env } from './config/environment';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({
    credentials: true, // Allow cookies to be sent
    origin: process.env.CORS_ORIGIN || true, // Configure allowed origins
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(sessionConfig);

  // Serve static files for local uploads
  if (env.storage.provider === 'local' && env.storage.localPath) {
    app.use('/uploads', express.static(env.storage.localPath));
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

