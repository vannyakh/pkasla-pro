import mongoose from 'mongoose';
import { env } from './environment';
import { logger } from '@/utils/logger';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    const connection = await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connection established');
    return connection;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
};

