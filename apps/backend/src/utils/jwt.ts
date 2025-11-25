import { sign, verify, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/environment';
import type { UserRole } from '../modules/users/user.types';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

const signToken = (payload: TokenPayload, secret: string, expiresIn: string) =>
  sign(payload, secret, { expiresIn } as SignOptions);

export const signAccessToken = (payload: TokenPayload) =>
  signToken(payload, env.jwt.accessSecret, env.jwt.accessExpiresIn);

export const signRefreshToken = (payload: TokenPayload) =>
  signToken(payload, env.jwt.refreshSecret, env.jwt.refreshExpiresIn);

export const verifyAccessToken = (token: string): DecodedToken =>
  verify(token, env.jwt.accessSecret) as DecodedToken;

export const verifyRefreshToken = (token: string): DecodedToken =>
  verify(token, env.jwt.refreshSecret) as DecodedToken;

