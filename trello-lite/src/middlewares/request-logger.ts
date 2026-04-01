import { logger } from '@/configs';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to log incoming HTTP requests with method, path, status code, and duration.
 * Uses warn level for 4xx/5xx responses, info level for successful ones.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log after the response is fully sent to capture the final status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};
