import { connectDatabase, disconnectDatabase } from '../config/database';
import { seedDatabaseIfNeeded } from './seeder';
import { logger } from './logger';

async function runSeed() {
  try {
    await connectDatabase();
    const force = process.argv.includes('--reset');
    await seedDatabaseIfNeeded(force);
    logger.info('Seed CLI finished successfully.');
    await disconnectDatabase();
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Seed CLI failed');
    process.exit(1);
  }
}

runSeed();
