import { HTTP_CODE, MESSAGES } from '@/constants';
import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

type Target = 'body' | 'query' | 'params';

// Middleware to validate request body, query, or params against a Zod schema
export const validate =
  (schema: ZodType, target: Target = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = req[target];

    // If validating the body and it's empty, return a 400 Bad Request
    if (target === 'body' && (!data || Object.keys(data).length === 0)) {
      return res.status(HTTP_CODE.BAD_REQUEST).json({
        errors: {
          code: 'BAD_REQUEST',
          message: MESSAGES.EMPTY_BODY,
        },
      });
    }

    // Validate the data against the provided Zod schema
    const result = schema.safeParse(data);

    // If validation fails, return a 400 Bad Request with error details
    if (!result.success) {
      return res.status(HTTP_CODE.BAD_REQUEST).json({
        errors: {
          code: 'BAD_REQUEST',
          message: MESSAGES.VALIDATION_FAILED,
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            description: issue.message,
          })),
        },
      });
    }

    Object.assign(req[target], result.data);
    next();
  };
