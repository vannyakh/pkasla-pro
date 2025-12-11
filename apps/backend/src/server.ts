// Suppress deprecation warning for url.parse() from dependencies
// This warning comes from older dependencies (like cors@2.8.5) that use url.parse()
// The warning is safe to suppress as it's from third-party code we can't directly modify
// Once dependencies are updated to use WHATWG URL API, this can be removed
// Set up warning handler BEFORE any imports that might trigger it
process.on('warning', (warning) => {
  // Suppress only the url.parse() deprecation warning (DEP0169)
  if (
    warning.name === 'DeprecationWarning' &&
    (warning.message.includes('DEP0169') || (warning as any).code === 'DEP0169') &&
    warning.message.includes('url.parse()')
  ) {
    return; // Suppress this warning
  }
  // Log other warnings normally
  console.warn(warning.name, warning.message);
});

import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/environment';
import { logger } from './utils/logger';
import { cacheService } from './common/services/cache.service';
import { telegramService } from './modules/settings/telegram.service';

const app = createApp();
let server: ReturnType<typeof app.listen>;

const initTelegramBot = async () => {
  if (!env.telegram?.botToken) {
    logger.info('Telegram bot not configured; skipping bot startup');
    return;
  }

  try {
    await telegramService.startBotWithChatIdCommand(env.telegram.botToken);
    logger.info('Telegram bot started with chat ID command handler');
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Failed to start Telegram bot service');
  }
};

const start = async () => {
  try {
    await connectDatabase();
    await initTelegramBot();
    server = app.listen(env.port, () => {
      logger.info(`🚀 Server ready at http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down...`);
  server?.close();
  await disconnectDatabase();
  await cacheService.disconnect();
  process.exit(0);
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => void shutdown(signal));
});

void start();

