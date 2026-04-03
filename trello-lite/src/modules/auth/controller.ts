import { HTTP_CODE } from '@/constants';
import { Request, Response } from 'express';
import { RegisterDTO } from './dto';
import { AuthService } from './service';

export const AuthController = {
  register: async (req: Request, res: Response) => {
    const body: RegisterDTO = req.body;
    const result = await AuthService.register(body);

    res.status(HTTP_CODE.CREATED).json(result);
  },
};
