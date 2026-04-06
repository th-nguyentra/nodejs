import { HTTP_CODE } from '@/constants';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const AuthController = {
  register: async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    res.status(HTTP_CODE.CREATED).json(result);
  },
  login: async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.status(HTTP_CODE.OK).json(result);
  },
};
