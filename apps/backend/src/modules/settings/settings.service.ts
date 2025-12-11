import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { settingsRepository } from './settings.repository';
import { clearSettingsCache } from './settings.utils';
import type { SettingsDocument } from './settings.model';

export interface UpdateSettingsDto {
  // General Settings
  siteName?: string;
  siteUrl?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  
  // Security Settings
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  requireEmailVerification?: boolean;
  enable2FA?: boolean;
  passwordMinLength?: number;
  
  // Storage Settings
  storageProvider?: 'local' | 'r2';
  storageLocalPath?: string;
  r2AccountId?: string;
  r2BucketName?: string;
  r2PublicUrl?: string;
  
  // Notification Settings
  emailEnabled?: boolean;
  emailFrom?: string;
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPassword?: string;
  notificationOnUserRegistration?: boolean;
  notificationOnUserStatusChange?: boolean;
  
  // Payment Settings
  // Stripe Configuration
  stripeEnabled?: boolean;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  // Bakong Configuration
  bakongEnabled?: boolean;
  bakongAccessToken?: string;
  bakongMerchantAccountId?: string;
  bakongWebhookSecret?: string;
  bakongApiUrl?: string;
  bakongEnvironment?: 'sit' | 'production';
  
  // Integration Settings
  // Telegram Bot Configuration
  telegramBotEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotifyOnGuestCheckIn?: boolean;
  telegramNotifyOnNewGuest?: boolean;
  telegramNotifyOnEventCreated?: boolean;
}

class SettingsService {
  /**
   * Get current settings
   */
  async getSettings() {
    const settings = await settingsRepository.get();
    if (!settings) {
      // Create default settings if none exist
      return await settingsRepository.getOrCreate();
    }
    return settings;
  }

  /**
   * Get settings with sensitive fields (for internal use)
   */
  async getSettingsWithSensitive() {
    return await settingsRepository.getWithSensitive();
  }

  /**
   * Update settings
   */
  async updateSettings(updateData: UpdateSettingsDto) {
    // Validate storage provider specific fields
    if (updateData.storageProvider === 'r2') {
      if (!updateData.r2AccountId || !updateData.r2BucketName) {
        throw new AppError(
          'R2 Account ID and Bucket Name are required when using R2 storage',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate email settings if email is enabled
    if (updateData.emailEnabled) {
      if (!updateData.emailFrom || !updateData.emailHost) {
        throw new AppError(
          'Email From and Host are required when email is enabled',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate session timeout
    if (updateData.sessionTimeout !== undefined) {
      if (updateData.sessionTimeout < 300 || updateData.sessionTimeout > 86400) {
        throw new AppError(
          'Session timeout must be between 300 and 86400 seconds',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate password min length
    if (updateData.passwordMinLength !== undefined) {
      if (updateData.passwordMinLength < 6 || updateData.passwordMinLength > 32) {
        throw new AppError(
          'Password minimum length must be between 6 and 32 characters',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate max login attempts
    if (updateData.maxLoginAttempts !== undefined) {
      if (updateData.maxLoginAttempts < 3 || updateData.maxLoginAttempts > 10) {
        throw new AppError(
          'Max login attempts must be between 3 and 10',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate email port
    if (updateData.emailPort !== undefined) {
      if (updateData.emailPort < 1 || updateData.emailPort > 65535) {
        throw new AppError(
          'Email port must be between 1 and 65535',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Get current settings to check if payment methods are already enabled
    const currentSettings = await this.getSettings();

    // Validate Stripe settings if Stripe is being enabled
    if (updateData.stripeEnabled && !currentSettings.stripeEnabled) {
      // Only require keys when enabling for the first time
      if (!updateData.stripeSecretKey || !updateData.stripePublishableKey) {
        throw new AppError(
          'Stripe Secret Key and Publishable Key are required when enabling Stripe',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate Bakong settings if Bakong is being enabled
    if (updateData.bakongEnabled && !currentSettings.bakongEnabled) {
      // Only require keys when enabling for the first time
      if (!updateData.bakongAccessToken || !updateData.bakongMerchantAccountId) {
        throw new AppError(
          'Bakong Access Token and Merchant Account ID are required when enabling Bakong',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Validate Telegram settings if Telegram bot is being enabled
    if (updateData.telegramBotEnabled && !currentSettings.telegramBotEnabled) {
      // Only require token when enabling for the first time
      if (!updateData.telegramBotToken) {
        throw new AppError(
          'Telegram Bot Token is required when enabling Telegram Bot',
          httpStatus.BAD_REQUEST
        );
      }
    }

    // Filter out empty strings for sensitive fields to preserve existing values
    const filteredUpdateData = { ...updateData };
    const sensitiveFields = [
      'stripeSecretKey',
      'stripeWebhookSecret',
      'bakongAccessToken',
      'bakongWebhookSecret',
      'emailPassword',
      'telegramBotToken',
    ] as const;

    for (const field of sensitiveFields) {
      if (filteredUpdateData[field] === '') {
        delete filteredUpdateData[field];
      }
    }

    const updated = await settingsRepository.updateFields(filteredUpdateData);
    
    // Clear cache after update
    clearSettingsCache();
    
    return updated;
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    const settings = await this.getSettings();
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      maintenanceMode: settings?.maintenanceMode || false,
    };
  }
}

export const settingsService = new SettingsService();

