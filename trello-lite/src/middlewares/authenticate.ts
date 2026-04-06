import { passport } from '@/configs';
import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: Express.Request['user']) => {
      if (err) return next(err);
      if (!user) return next(ApiError.unauthorized(MESSAGES.AUTH.INVALID_TOKEN));

      req.user = user;
      next();
    },
  )(req, res, next);
};
