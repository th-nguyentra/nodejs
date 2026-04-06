import { MESSAGES } from '@/constants';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6, MESSAGES.AUTH.PASSWORD_TOO_SHORT),
  username: z
    .string({ error: MESSAGES.AUTH.USERNAME_REQUIRED })
    .min(3, MESSAGES.AUTH.USERNAME_TOO_SHORT)
    .max(30, MESSAGES.AUTH.USERNAME_TOO_LONG),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, MESSAGES.AUTH.PASSWORD_TOO_SHORT),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
