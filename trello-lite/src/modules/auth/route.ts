import { Router } from 'express';
import { registerSchema } from './dto';
import { AuthController } from './controller';
import { validate } from '@/middlewares';

const router = Router();

router.post('/auth/register', validate(registerSchema), AuthController.register);

export const AuthRouter = router;
