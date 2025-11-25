import 'express-session';
import type { UserRole } from '../modules/users/user.types';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    email?: string;
    role?: UserRole;
    authenticated?: boolean;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: number;
    tempUserId?: string;
    tempEmail?: string;
    twoFactorRequired?: boolean;
  }
}

