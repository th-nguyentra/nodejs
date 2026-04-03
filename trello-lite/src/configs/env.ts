import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Centralized environment configuration with defaults
export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? '',
  testDatabaseUrl: process.env.DATABASE_URL_TEST ?? '',
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '604800', 10),
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY ?? '',
    from: process.env.SENDGRID_FROM ?? '',
  },
};
