import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';
import { logger } from '../utils/logger';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<{ uri: string; isEmbedded: boolean }> {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    logger.info(`Connected to MongoDB at ${env.MONGODB_URI}`);
    return { uri: env.MONGODB_URI, isEmbedded: false };
  } catch {
    logger.info('Starting local MongoDB server on port 27017...');
    try {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          launchTimeout: 60000,
        },
      });
    } catch {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 60000,
        },
      });
    }

    const memUri = memoryServer.getUri('visiontechsolutions');
    await mongoose.connect(memUri);
    logger.info(`Connected to Local MongoDB instance (${memUri})`);
    return { uri: memUri, isEmbedded: true };
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
