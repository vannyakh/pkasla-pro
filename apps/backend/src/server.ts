import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/environment';
import { logger } from './utils/logger';
import { cacheService } from './common/services/cache.service';

const app = createApp();
let server: ReturnType<typeof app.listen>;

const start = async () => {
  try {
    await connectDatabase();
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

