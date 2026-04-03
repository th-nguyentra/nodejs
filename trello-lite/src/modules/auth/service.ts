import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '@/utils';
import { LoginDTO, RegisterDTO } from './dto';
import { AuthRepository } from './repository';
import { MESSAGES, SALT_ROUNDS } from '@/constants';
import { env } from '@/configs';

const generateAuthToken = (userId: string) =>
  jwt.sign({ userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

export const AuthService = {
  register: async ({ email, username, password }: RegisterDTO) => {
    const existingUser = await AuthRepository.findByUsernameOrEmail(username, email);

    // Check if user with the same email or username already exists
    if (existingUser) {
      throw ApiError.conflict(MESSAGES.AUTH.USER_ALREADY_EXISTS);
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await AuthRepository.createUser({
      email,
      username,
      password: hashedPassword,
    });

    const { password: _, ...safeUser } = user;

    return { data: safeUser, access: generateAuthToken(user.id) };
  },
  login: async ({ email, password }: LoginDTO) => {
    const user = await AuthRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const { password: _, ...safeUser } = user;

    return { data: safeUser, access: generateAuthToken(user.id) };
  },
};
