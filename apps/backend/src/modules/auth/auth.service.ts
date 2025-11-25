import httpStatus from 'http-status';
import type { Request } from 'express';
import type { z } from 'zod';
import { AppError } from '@/common/errors/app-error';
import { userService } from '../users/user.service';
import { userRepository } from '../users/user.repository';
import { hashPassword, comparePassword } from '@/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } from '@/utils/jwt';
import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  type TwoFactorSetup,
} from '@/utils/two-factor';
import { TokenBlacklistModel } from './token-blacklist.model';
import { registerSchema, loginSchema, refreshSchema, providerLoginSchema } from './auth.validation';
import type { UserResponse } from '../users/user.service';
import type { OAuthProvider } from '../users/user.types';

type RegisterInput = z.infer<typeof registerSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];
type RefreshInput = z.infer<typeof refreshSchema>['body'];
type ProviderLoginInput = z.infer<typeof providerLoginSchema>['body'];

const buildAuthResponse = (
  user: UserResponse,
  tokens: { accessToken: string; refreshToken: string },
) => ({
  user,
  tokens,
});

class AuthService {
  async register(payload: RegisterInput, req: Request) {
    const password = await hashPassword(payload.password);
    const user = await userService.create({ ...payload, password });
    const tokens = this.generateTokens(user);
    
    // Store tokens in session
    if (req.session) {
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.authenticated = true;
      req.session.accessToken = tokens.accessToken;
      req.session.refreshToken = tokens.refreshToken;
      req.session.tokenExpiresAt = this.getTokenExpiration();
    }
    
    return buildAuthResponse(user, tokens);
  }

  async login(payload: LoginInput, req: Request) {
    const userWithTwoFactor = await userService.findByEmailOrPhoneWithTwoFactor(payload.emailOrPhone);
    if (!userWithTwoFactor) {
      throw new AppError('Invalid credentials', httpStatus.UNAUTHORIZED);
    }

    const isValid = await comparePassword(payload.password, userWithTwoFactor.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', httpStatus.UNAUTHORIZED);
    }

    const user = await userService.findById(userWithTwoFactor.id);
    if (!user) {
      throw new AppError('Account not found', httpStatus.UNAUTHORIZED);
    }

    // Check if 2FA is enabled
    if (userWithTwoFactor.twoFactorEnabled && userWithTwoFactor.twoFactorSecret) {
      // Store temporary session for 2FA verification
      if (req.session) {
        req.session.tempUserId = user.id;
        req.session.tempEmail = user.email;
        req.session.twoFactorRequired = true;
      }
      return {
        requiresTwoFactor: true,
        message: 'Two-factor authentication required',
      };
    }

    // No 2FA - complete login
    const tokens = this.generateTokens(user);
    if (req.session) {
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.authenticated = true;
      req.session.accessToken = tokens.accessToken;
      req.session.refreshToken = tokens.refreshToken;
      req.session.tokenExpiresAt = this.getTokenExpiration();
    }
    return buildAuthResponse(user, tokens);
  }

  async verifyTwoFactorLogin(token: string, req: Request) {
    if (!req.session?.tempUserId || !req.session?.twoFactorRequired || !req.session?.tempEmail) {
      throw new AppError('Two-factor authentication session expired', httpStatus.UNAUTHORIZED);
    }

    const userWithTwoFactor = await userService.findByEmailWithTwoFactor(req.session.tempEmail);
    if (!userWithTwoFactor || !userWithTwoFactor.twoFactorSecret) {
      throw new AppError('Invalid session', httpStatus.UNAUTHORIZED);
    }

    // Verify TOTP token
    const isValidToken = verifyTwoFactorToken(token, userWithTwoFactor.twoFactorSecret);
    let usedBackupCode = false;

    // If TOTP fails, try backup codes
    if (!isValidToken && userWithTwoFactor.twoFactorBackupCodes) {
      const backupResult = await verifyBackupCode(token, userWithTwoFactor.twoFactorBackupCodes);
      if (backupResult.valid) {
        usedBackupCode = true;
        // Update user with remaining backup codes
        await userService.updateTwoFactor(userWithTwoFactor.id, {
          twoFactorBackupCodes: backupResult.remainingCodes,
        });
      } else {
        throw new AppError('Invalid two-factor authentication code', httpStatus.UNAUTHORIZED);
      }
    } else if (!isValidToken) {
      throw new AppError('Invalid two-factor authentication code', httpStatus.UNAUTHORIZED);
    }

    // 2FA verified - complete login
    const user = await userService.findById(req.session.tempUserId);
    if (!user) {
      throw new AppError('Account not found', httpStatus.UNAUTHORIZED);
    }

    const tokens = this.generateTokens(user);
    if (req.session) {
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.authenticated = true;
      req.session.accessToken = tokens.accessToken;
      req.session.refreshToken = tokens.refreshToken;
      req.session.tokenExpiresAt = this.getTokenExpiration();
      delete req.session.tempUserId;
      delete req.session.tempEmail;
      delete req.session.twoFactorRequired;
    }

    return {
      ...buildAuthResponse(user, tokens),
      usedBackupCode,
    };
  }

  async setupTwoFactor(userId: string) {
    const user = await userService.findById(userId);
    if (!user || !user.email) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);
    if (!otpauthUrl) {
      throw new AppError('Failed to generate 2FA secret', httpStatus.INTERNAL_SERVER_ERROR);
    }
    const qrCodeUrl = await generateQRCode(otpauthUrl);
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    // Store secret and backup codes (but don't enable yet)
    await userService.updateTwoFactor(userId, {
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedBackupCodes,
    });

    return {
      secret,
      qrCodeUrl,
      backupCodes, // Return plain codes only once
    } as TwoFactorSetup;
  }

  async verifyTwoFactorSetup(userId: string, token: string) {
    const user = await userService.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    const userWithTwoFactor = await userService.findByEmailWithTwoFactor(user.email);
    if (!userWithTwoFactor || !userWithTwoFactor.twoFactorSecret) {
      throw new AppError('Two-factor setup not initiated', httpStatus.BAD_REQUEST);
    }

    const isValid = verifyTwoFactorToken(token, userWithTwoFactor.twoFactorSecret);
    if (!isValid) {
      throw new AppError('Invalid verification code', httpStatus.BAD_REQUEST);
    }

    // Enable 2FA
    await userService.updateTwoFactor(userId, {
      twoFactorEnabled: true,
    });

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disableTwoFactor(userId: string, password: string) {
    const userWithPassword = await userService.findByEmailWithPassword(
      (await userService.findById(userId))?.email || '',
    );
    if (!userWithPassword) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    const isValid = await comparePassword(password, userWithPassword.password);
    if (!isValid) {
      throw new AppError('Invalid password', httpStatus.UNAUTHORIZED);
    }

    await userService.updateTwoFactor(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      twoFactorBackupCodes: [],
    });

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async refresh(payload: RefreshInput, req: Request) {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(payload.refreshToken);
      if (isBlacklisted) {
        throw new AppError('Token has been revoked', httpStatus.UNAUTHORIZED);
      }

      const decoded = verifyRefreshToken(payload.refreshToken);
      const user = await userService.findById(decoded.sub);
      if (!user) {
        throw new AppError('Account not found', httpStatus.UNAUTHORIZED);
      }

      // Blacklist the old refresh token
      await this.blacklistToken(payload.refreshToken);

      const tokens = this.generateTokens(user);
      
      // Store tokens in session
      if (req.session) {
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.role = user.role;
        req.session.authenticated = true;
        req.session.accessToken = tokens.accessToken;
        req.session.refreshToken = tokens.refreshToken;
        req.session.tokenExpiresAt = this.getTokenExpiration();
      }

      return buildAuthResponse(user, tokens);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Invalid refresh token', httpStatus.UNAUTHORIZED);
    }
  }

  async providerLogin(payload: ProviderLoginInput, req: Request) {
    const { provider, providerId, accessToken, email, firstName, lastName, avatar } = payload;

    // Verify the access token with the provider (this is a simplified version)
    // In production, you should verify the token with the actual OAuth provider
    // For now, we'll trust the token if it's provided (NextAuth.js handles verification)
    
    // Try to find existing user by provider
    let user = await userService.findByProvider(provider, providerId);

    // If user not found by provider, try to find by email (account linking)
    if (!user) {
      const existingUser = await userService.findByEmail(email);
      if (existingUser && !existingUser.provider) {
        // Link the provider to existing account (only if account doesn't have a provider)
        await userRepository.updateById(existingUser.id, {
          provider: provider as OAuthProvider,
          providerId,
        });
        user = await userService.findById(existingUser.id);
      } else if (existingUser && existingUser.provider) {
        // Account already has a different provider
        throw new AppError('Email already registered with a different provider', httpStatus.CONFLICT);
      }
    }

    // If still no user, create a new one
    if (!user) {
      // Check if email already exists
      const existingEmailUser = await userService.findByEmail(email);
      if (existingEmailUser) {
        throw new AppError('Email already registered. Please use email/password login or link your account.', httpStatus.CONFLICT);
      }

      // Create new user with OAuth provider
      const newUser = await userService.create({
        firstName,
        lastName,
        email,
        role: 'job_seeker', // Default role for OAuth users
        provider: provider as OAuthProvider,
        providerId,
      });

      // Update profile with avatar if provided
      if (avatar) {
        await userService.updateProfile(newUser.id, {
          profile: {
            avatarUrl: avatar,
          },
        });
      }

      user = await userService.findById(newUser.id);
    } else {
      // Update profile avatar if provided and different
      if (avatar && user.profile?.avatarUrl !== avatar) {
        await userService.updateProfile(user.id, {
          profile: {
            ...user.profile,
            avatarUrl: avatar,
          },
        });
        user = await userService.findById(user.id);
      }
    }

    if (!user) {
      throw new AppError('Failed to authenticate user', httpStatus.INTERNAL_SERVER_ERROR);
    }

    // Generate tokens and set session
    const tokens = this.generateTokens(user);
    if (req.session) {
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.authenticated = true;
      req.session.accessToken = tokens.accessToken;
      req.session.refreshToken = tokens.refreshToken;
      req.session.tokenExpiresAt = this.getTokenExpiration();
    }

    return buildAuthResponse(user, tokens);
  }

  async logout(req: Request) {
    if (!req.session) {
      throw new AppError('No active session', httpStatus.BAD_REQUEST);
    }

    const accessToken = req.session.accessToken;
    const refreshToken = req.session.refreshToken;

    // Blacklist tokens if they exist
    if (accessToken) {
      await this.blacklistToken(accessToken);
    }
    if (refreshToken) {
      await this.blacklistToken(refreshToken);
    }

    // Destroy session
    return new Promise<void>((resolve, reject) => {
      req.session?.destroy((err) => {
        if (err) {
          reject(new AppError('Failed to logout', httpStatus.INTERNAL_SERVER_ERROR));
        } else {
          resolve();
        }
      });
    });
  }

  private async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = verifyAccessToken(token);
      const expiresAt = new Date(decoded.exp * 1000);
      
      await TokenBlacklistModel.create({
        token,
        expiresAt,
      });
    } catch (error) {
      // If it's a refresh token, try to decode it
      try {
        const decoded = verifyRefreshToken(token);
        const expiresAt = new Date(decoded.exp * 1000);
        
        await TokenBlacklistModel.create({
          token,
          expiresAt,
        });
      } catch {
        // Token is invalid, but we'll still try to blacklist it with a short expiration
        await TokenBlacklistModel.create({
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
      }
    }
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await TokenBlacklistModel.findOne({ token });
    return !!blacklisted;
  }

  private getTokenExpiration(): number {
    // Parse expiration from JWT access token expiresIn (e.g., "15m")
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) {
      return Date.now() + 15 * 60 * 1000; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    let milliseconds = value;

    switch (unit) {
      case 's':
        milliseconds *= 1000;
        break;
      case 'm':
        milliseconds *= 60 * 1000;
        break;
      case 'h':
        milliseconds *= 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds *= 24 * 60 * 60 * 1000;
        break;
    }

    return Date.now() + milliseconds;
  }

  private generateTokens(user: UserResponse) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();

