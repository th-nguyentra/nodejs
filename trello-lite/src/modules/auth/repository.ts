import { prisma } from '@/configs';
import { RegisterDTO } from './dto';

export const AuthRepository = {
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
