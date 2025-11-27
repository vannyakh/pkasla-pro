import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { settingsRepository } from './settings.repository';
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

    return await settingsRepository.updateFields(updateData);
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

