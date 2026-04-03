import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils';
import { NextFunction, Request, Response } from 'express';

/**
 * Global Express error-handling middleware.
 * - Known ApiError: responds with the error's own status code and message.
 * - Unknown Error: falls back to 500 Internal Server Error to avoid leaking details.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Operational error — safe to expose message and status code to the client
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      errors: { code: err.errorCode, message: err.message },
    });

    return;
  }

  // Unexpected error — hide internal details, return generic 500
  const { statusCode, errorCode, message } = ApiError.internal(MESSAGES.INTERNAL_SERVER_ERROR);
  res.status(statusCode).json({
    errors: { code: errorCode, message },
  });
};
