import pino from 'pino';
import { env } from '../config/environment';

const transport = env.isProduction
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };

export const logger = pino({
  level: env.logLevel,
  transport,
  base: { env: env.nodeEnv },
});

export type Logger = typeof logger;

