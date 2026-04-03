import { HTTP_CODE, MESSAGES } from '@/constants';
import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

// Middleware to validate request body using Zod schemas
export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  // Check if request body is empty
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(HTTP_CODE.BAD_REQUEST).json({
      errors: {
        code: 'BAD_REQUEST',
        message: MESSAGES.EMPTY_BODY,
      },
    });

    return;
  }

  const result = schema.safeParse(req.body);

  // If validation fails, return a 400 Bad Request with error details
  if (!result.success) {
    res.status(HTTP_CODE.BAD_REQUEST).json({
      errors: {
        code: 'BAD_REQUEST',
        message: MESSAGES.VALIDATION_FAILED,
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          description: issue.message,
        })),
      },
    });

    return;
  }

  req.body = result.data;
  next();
};
