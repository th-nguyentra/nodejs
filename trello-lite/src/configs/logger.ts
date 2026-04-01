import { env } from '@/configs';
import winston from 'winston';

const { combine, timestamp, errors, colorize, printf } = winston.format;

// Define the log format for console output
const format = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) =>
    stack ? `${timestamp} [${level}] ${message}\n${stack}` : `${timestamp} [${level}] ${message}`,
  ),
);

// Create the logger instance
export const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format,
    }),
  ],
});
