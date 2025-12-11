import axios from 'axios';
import { logger } from '@/utils/logger';

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
}

class TelegramService {
  /**
   * Send a message via Telegram Bot
   */
  async sendMessage(botToken: string, message: TelegramMessage): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await axios.post(url, {
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'Markdown',
      });

      if (response.data.ok) {
        logger.info('Telegram message sent successfully', {
          chatId: message.chatId,
        });
        return true;
      } else {
        logger.error('Failed to send Telegram message', {
          error: response.data.description,
        });
        return false;
      }
    } catch (error) {
      logger.error('Error sending Telegram message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Test Telegram bot connection
   */
  async testConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
    try {
      // First, verify the bot token by getting bot info
      const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
      const botInfoResponse = await axios.get(botInfoUrl);

      if (!botInfoResponse.data.ok) {
        return {
          success: false,
          message: 'Invalid bot token. Please check your Telegram Bot Token.',
        };
      }

      const botUsername = botInfoResponse.data.result.username;

      // Send test message
      const testMessage = {
        chatId,
        text: `✅ *Connection Successful!*\n\nYour Telegram bot (@${botUsername}) is now connected.\n\nYou will receive notifications for your events here.`,
        parseMode: 'Markdown' as const,
      };

      const messageSent = await this.sendMessage(botToken, testMessage);

      if (messageSent) {
        return {
          success: true,
          message: 'Test message sent successfully! Check your Telegram.',
        };
      } else {
        return {
          success: false,
          message: 'Failed to send test message. Please check your Chat ID.',
        };
      }
    } catch (error) {
      logger.error('Error testing Telegram connection', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return {
            success: false,
            message: 'Invalid bot token. Please check your Telegram Bot Token.',
          };
        } else if (error.response?.status === 400) {
          return {
            success: false,
            message: 'Invalid chat ID or bot token. Please verify your credentials.',
          };
        }
      }

      return {
        success: false,
        message: 'Failed to connect to Telegram. Please check your bot token and chat ID.',
      };
    }
  }

  /**
   * Send notification for guest check-in
   */
  async notifyGuestCheckIn(
    botToken: string,
    chatId: string,
    guestName: string,
    eventName: string
  ): Promise<boolean> {
    const message = {
      chatId,
      text: `✅ *Guest Checked In*\n\n👤 *Guest:* ${guestName}\n📅 *Event:* ${eventName}\n⏰ *Time:* ${new Date().toLocaleString()}`,
      parseMode: 'Markdown' as const,
    };

    return await this.sendMessage(botToken, message);
  }

  /**
   * Send notification for new guest
   */
  async notifyNewGuest(
    botToken: string,
    chatId: string,
    guestName: string,
    eventName: string
  ): Promise<boolean> {
    const message = {
      chatId,
      text: `🆕 *New Guest Added*\n\n👤 *Guest:* ${guestName}\n📅 *Event:* ${eventName}\n⏰ *Added:* ${new Date().toLocaleString()}`,
      parseMode: 'Markdown' as const,
    };

    return await this.sendMessage(botToken, message);
  }

  /**
   * Send notification for new event
   */
  async notifyEventCreated(
    botToken: string,
    chatId: string,
    eventName: string,
    eventDate: Date
  ): Promise<boolean> {
    const message = {
      chatId,
      text: `🎉 *New Event Created*\n\n📅 *Event:* ${eventName}\n📆 *Date:* ${eventDate.toLocaleDateString()}\n⏰ *Created:* ${new Date().toLocaleString()}`,
      parseMode: 'Markdown' as const,
    };

    return await this.sendMessage(botToken, message);
  }
}

export const telegramService = new TelegramService();
