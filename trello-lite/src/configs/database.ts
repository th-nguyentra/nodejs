import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { env } from './env';

const connectionString = env.nodeEnv === 'test' ? env.testDatabaseUrl : env.databaseUrl;
const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
