import session from 'express-session';
import MongoStore from 'connect-mongo';
import type { RequestHandler } from 'express-serve-static-core';
import { env } from './environment';

export const sessionConfig: RequestHandler = session({
  secret: env.session.secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.mongoUri,
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days
    touchAfter: 24 * 3600, // lazy session update after 24 hours
  }),
  cookie: {
    secure: env.isProduction, // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: env.isProduction ? 'strict' : 'lax',
  },
  name: 'sessionId', // Don't use default 'connect.sid' for security
});

