import { prisma } from '@/configs';
import { RegisterDTO } from './auth.dto';

export const AuthRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findByUsernameOrEmail: (username: string, email: string) =>
    prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    }),
  createUser: async (data: RegisterDTO) =>
    prisma.user.create({
      data,
    }),
};
