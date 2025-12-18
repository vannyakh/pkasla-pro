import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';
import { UserModel } from '@/modules/users/user.model';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

class GoogleOAuthService {
  private oauth2Client: OAuth2Client | null = null;

  /**
   * Initialize OAuth2 client
   */
  private getOAuth2Client(): OAuth2Client {
    if (this.oauth2Client) {
      return this.oauth2Client;
    }

    if (!env.googleOAuth) {
      throw new AppError('Google OAuth is not configured', httpStatus.SERVICE_UNAVAILABLE);
    }

    this.oauth2Client = new google.auth.OAuth2(
      env.googleOAuth.clientId,
      env.googleOAuth.clientSecret,
      env.googleOAuth.redirectUri
    );

    return this.oauth2Client;
  }

  /**
   * Generate OAuth URL for user to authorize
   */
  generateAuthUrl(userId: string): string {
    const oauth2Client = this.getOAuth2Client();

    return oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: SCOPES,
      state: userId, // Pass userId to identify user in callback
      prompt: 'consent', // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  }> {
    const oauth2Client = this.getOAuth2Client();

    try {
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new AppError('No access token received', httpStatus.BAD_REQUEST);
      }

      if (!tokens.refresh_token) {
        throw new AppError('No refresh token received. User may need to reauthorize.', httpStatus.BAD_REQUEST);
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date 
          ? new Date(tokens.expiry_date) 
          : new Date(Date.now() + 3600 * 1000), // Default 1 hour
      };
    } catch (error: any) {
      logger.error({ error }, 'Failed to exchange authorization code for tokens');
      throw new AppError(error.message || 'Failed to get tokens from authorization code', httpStatus.BAD_REQUEST);
    }
  }

  /**
   * Save tokens to user document
   */
  async saveUserTokens(
    userId: string,
    tokens: { accessToken: string; refreshToken: string; expiryDate: Date }
  ): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        googleSheetsAccessToken: tokens.accessToken,
        googleSheetsRefreshToken: tokens.refreshToken,
        googleSheetsTokenExpiry: tokens.expiryDate,
      });

      logger.info({ userId }, 'Saved Google Sheets OAuth tokens for user');
    } catch (error) {
      logger.error({ error, userId }, 'Failed to save OAuth tokens');
      throw new AppError('Failed to save authorization', httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user's OAuth credentials
   */
  async getUserTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  } | null> {
    const user = await UserModel.findById(userId)
      .select('+googleSheetsAccessToken +googleSheetsRefreshToken +googleSheetsTokenExpiry');

    if (!user || !user.googleSheetsAccessToken || !user.googleSheetsRefreshToken) {
      return null;
    }

    return {
      accessToken: user.googleSheetsAccessToken,
      refreshToken: user.googleSheetsRefreshToken,
      expiryDate: user.googleSheetsTokenExpiry || new Date(),
    };
  }

  /**
   * Refresh access token if expired
   */
  async refreshAccessToken(userId: string): Promise<string> {
    const tokens = await this.getUserTokens(userId);

    if (!tokens) {
      throw new AppError('No Google Sheets authorization found', httpStatus.UNAUTHORIZED);
    }

    // Check if token is expired (with 5 minute buffer)
    const now = new Date();
    const expiryWithBuffer = new Date(tokens.expiryDate.getTime() - 5 * 60 * 1000);

    if (now < expiryWithBuffer) {
      // Token still valid
      return tokens.accessToken;
    }

    // Refresh token
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: tokens.refreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new AppError('Failed to refresh access token', httpStatus.UNAUTHORIZED);
      }

      // Save new access token
      await UserModel.findByIdAndUpdate(userId, {
        googleSheetsAccessToken: credentials.access_token,
        googleSheetsTokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : new Date(Date.now() + 3600 * 1000),
      });

      logger.info({ userId }, 'Refreshed Google Sheets access token');

      return credentials.access_token;
    } catch (error: any) {
      logger.error({ error, userId }, 'Failed to refresh access token');
      throw new AppError('Failed to refresh authorization. Please reconnect your Google account.', httpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Get authenticated OAuth2 client for user
   */
  async getUserOAuth2Client(userId: string): Promise<OAuth2Client> {
    const accessToken = await this.refreshAccessToken(userId);

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    return oauth2Client;
  }

  /**
   * Check if user has connected their Google account
   */
  async isConnected(userId: string): Promise<boolean> {
    const tokens = await this.getUserTokens(userId);
    return tokens !== null;
  }

  /**
   * Disconnect user's Google account
   */
  async disconnect(userId: string): Promise<void> {
    const tokens = await this.getUserTokens(userId);

    if (tokens) {
      // Revoke tokens
      const oauth2Client = this.getOAuth2Client();
      try {
        await oauth2Client.revokeToken(tokens.accessToken);
      } catch (error) {
        logger.warn({ error, userId }, 'Failed to revoke Google OAuth token');
        // Continue anyway to clear from database
      }
    }

    // Clear tokens from database
    await UserModel.findByIdAndUpdate(userId, {
      $unset: {
        googleSheetsAccessToken: 1,
        googleSheetsRefreshToken: 1,
        googleSheetsTokenExpiry: 1,
      },
    });

    logger.info({ userId }, 'Disconnected Google Sheets for user');
  }

  /**
   * Get user's Google account info
   */
  async getUserInfo(userId: string): Promise<{ email: string; name: string } | null> {
    try {
      const tokens = await this.getUserTokens(userId);
      
      if (!tokens) {
        logger.warn({ userId }, 'No tokens available for user info');
        return null;
      }

      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      return {
        email: data.email || '',
        name: data.name || '',
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user info from Google');
      return null;
    }
  }
}

export const googleOAuthService = new GoogleOAuthService();

