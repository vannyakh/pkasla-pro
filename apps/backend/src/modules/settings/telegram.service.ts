import { Bot } from 'grammy';
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
      const bot = new Bot(botToken);
      
      await bot.api.sendMessage(message.chatId, message.text, {
        parse_mode: message.parseMode || 'Markdown',
      });

      logger.info({
        chatId: message.chatId,
      }, 'Telegram message sent successfully');
      return true;
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Error sending Telegram message');
      return false;
    }
  }

  /**
   * Test Telegram bot connection
   */
  async testConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
    try {
      const bot = new Bot(botToken);
      
      // First, verify the bot token by getting bot info
      const botInfo = await bot.api.getMe();
      const botUsername = botInfo.username;

      if (!botUsername) {
        return {
          success: false,
          message: 'Invalid bot token. Please check your Telegram Bot Token.',
        };
      }

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
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Error testing Telegram connection');

      // Handle grammy API errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return {
            success: false,
            message: 'Invalid bot token. Please check your Telegram Bot Token.',
          };
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
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

  /**
   * Send notification for gift added
   */
  async notifyGiftAdded(
    botToken: string,
    chatId: string,
    guestName: string,
    eventName: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<boolean> {
    const message = {
      chatId,
      text: `🎁 *Gift Added *\n\n👤 *Guest:* ${guestName}\n📅 *Event:* ${eventName}\n💰 *Amount:* ${amount} ${currency}\n💳 *Payment Method:* ${paymentMethod}\n⏰ *Time:* ${new Date().toLocaleString()}`,
      parseMode: 'Markdown' as const,
    };

    return await this.sendMessage(botToken, message);
  }

  /**
   * Start bot with command handler to get chat ID
   * This method sets up a bot that listens for /getchatid command
   * and returns the chat ID to the user
   */
  async startBotWithChatIdCommand(botToken: string): Promise<void> {
    try {
      const bot = new Bot(botToken);

      // Handle /getchatid or /chatid command
      bot.command(['getchatid', 'chatid'], async (ctx) => {
        const chatId = ctx.chat.id.toString();
        const chatType = ctx.chat.type;
        // const chatTitle = 'title' in ctx.chat ? ctx.chat.title : undefined;
        // const firstName = 'first_name' in ctx.chat ? ctx.chat.first_name : undefined;
        // const username = 'username' in ctx.chat ? ctx.chat.username : undefined;

        let responseText = `📋 *Your Chat ID: *\`${chatId}\`\n`;
        // responseText += `*Chat Type:* ${chatType}\n`;

        // if (chatTitle) {
        //   responseText += `*Chat Title:* ${chatTitle}\n`;
        // }
        // if (firstName) {
        //   responseText += `*First Name:* ${firstName}\n`;
        // }
        // if (username) {
        //   responseText += `*Username:* \`@${username}\`\n`;
        // }

        responseText += `\n💡 *Copy the Chat ID above and use it in your settings.*`;

        await ctx.reply(responseText, {
          parse_mode: 'Markdown',
        });

        logger.info({
          chatId,
          chatType,
          userId: ctx.from?.id,
        }, 'Chat ID requested');
      });

      // Handle /start command with helpful message
      bot.command('start', async (ctx) => {
        await ctx.reply(
          `👋 *Welcome!*\n\n` +
            `Use /getchatid or /chatid to get your Chat ID.\n\n` +
            `This Chat ID is needed to receive notifications from the system.`,
          {
            parse_mode: 'Markdown',
          }
        );
      });

      // Handle /help command
      bot.command('help', async (ctx) => {
        await ctx.reply(
          `📚 *Available Commands:*\n\n` +
            `/getchatid or /chatid - Get your Chat ID\n` +
            `/start - Start the bot\n` +
            `/help - Show this help message`,
          {
            parse_mode: 'Markdown',
          }
        );
      });

      // Start the bot
      bot.start();
      logger.info('Telegram bot started with chat ID command handler');
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Error starting Telegram bot');
      throw error;
    }
  }
}

export const telegramService = new TelegramService();
