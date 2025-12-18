import { settingsRepository } from './settings.repository';
import { telegramService } from './telegram.service';
import { userService } from '@/modules/users/user.service';
import { env } from '@/config/environment';
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

  /**
   * Generic method to send Telegram notification to a specific user
   * Checks if user has Telegram connected and sends notification
   * @param userId - The user ID to send notification to
   * @param sendNotification - Callback function that sends the notification (receives botToken and chatId)
   */
  async sendUserTelegramNotification(
    userId: string,
    sendNotification: (botToken: string, chatId: string) => Promise<boolean>
  ): Promise<void> {
    try {
      const user = await userService.findById(userId);
      
      if (!user?.isTelegramBot || !user?.telegramChatId) {
        // User doesn't have Telegram connected, silently return
        return;
      }

      // Get bot token from settings or environment
      const settings = await settingsRepository.getWithSensitive();
      const botToken = settings?.telegramBotToken || env.telegram?.botToken;

      if (!botToken) {
        logger.warn('Telegram bot token not configured');
        return;
      }

      await sendNotification(botToken, user.telegramChatId);
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      }, 'Failed to send user Telegram notification');
    }
  }

  /**
   * Send notification to user when a gift is added
   */
  async notifyUserGiftAdded(
    userId: string,
    guestName: string,
    eventName: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<void> {
    await this.sendUserTelegramNotification(userId, async (botToken, chatId) => {
      return await telegramService.notifyGiftAdded(
        botToken,
        chatId,
        guestName,
        eventName,
        amount,
        currency,
        paymentMethod
      );
    });
  }
}

export const notificationHelper = new NotificationHelper();
