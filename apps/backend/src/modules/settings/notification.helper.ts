import { settingsRepository } from './settings.repository';
import { telegramService } from './telegram.service';
import { logger } from '@/utils/logger';

/**
 * Notification Helper
 * Centralized helper for sending notifications based on settings
 */
class NotificationHelper {
  /**
   * Send notification when a guest checks in
   */
  async notifyGuestCheckIn(guestName: string, eventName: string): Promise<void> {
    try {
      const settings = await settingsRepository.getWithSensitive();
      
      if (!settings?.telegramBotEnabled || !settings?.telegramNotifyOnGuestCheckIn) {
        return;
      }

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        logger.warn('Telegram bot enabled but credentials missing');
        return;
      }

      await telegramService.notifyGuestCheckIn(
        settings.telegramBotToken,
        settings.telegramChatId,
        guestName,
        eventName
      );
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to send guest check-in notification');
    }
  }

  /**
   * Send notification when a new guest is added
   */
  async notifyNewGuest(guestName: string, eventName: string): Promise<void> {
    try {
      const settings = await settingsRepository.getWithSensitive();
      
      if (!settings?.telegramBotEnabled || !settings?.telegramNotifyOnNewGuest) {
        return;
      }

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        logger.warn('Telegram bot enabled but credentials missing');
        return;
      }

      await telegramService.notifyNewGuest(
        settings.telegramBotToken,
        settings.telegramChatId,
        guestName,
        eventName
      );
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to send new guest notification');
    }
  }

  /**
   * Send notification when a new event is created
   */
  async notifyEventCreated(eventName: string, eventDate: Date): Promise<void> {
    try {
      const settings = await settingsRepository.getWithSensitive();
      
      if (!settings?.telegramBotEnabled || !settings?.telegramNotifyOnEventCreated) {
        return;
      }

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        logger.warn('Telegram bot enabled but credentials missing');
        return;
      }

      await telegramService.notifyEventCreated(
        settings.telegramBotToken,
        settings.telegramChatId,
        eventName,
        eventDate
      );
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to send event created notification');
    }
  }

  /**
   * Send custom Telegram message
   */
  async sendCustomMessage(text: string): Promise<void> {
    try {
      const settings = await settingsRepository.getWithSensitive();
      
      if (!settings?.telegramBotEnabled) {
        return;
      }

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        logger.warn('Telegram bot enabled but credentials missing');
        return;
      }

      await telegramService.sendMessage(settings.telegramBotToken, {
        chatId: settings.telegramChatId,
        text,
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to send custom Telegram message');
    }
  }
}

export const notificationHelper = new NotificationHelper();
