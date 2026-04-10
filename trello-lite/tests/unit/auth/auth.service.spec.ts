import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthRepository } from '@/modules/auth/auth.repository';
import { ApiError } from '@/utils';
import { MESSAGES } from '@/constants';

jest.mock('@/modules/auth/auth.repository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockAuthRepository = jest.mocked(AuthRepository);
const mockBcrypt = jest.mocked(bcrypt);
const mockJwt = jest.mocked(jwt);

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAuthToken', () => {
    it('should call jwt.sign and return token', () => {
      mockJwt.sign.mockReturnValue('token123' as never);

      const token = AuthService.generateAuthToken('user-id');

      expect(token).toBe('token123');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user-id' },
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.anything() }),
      );
    });
  });

  describe('register', () => {
    const registerData = { email: 'test@test.com', username: 'testuser', password: 'secret123' };

    it('should throw conflict if user already exists', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      await expect(AuthService.register(registerData)).rejects.toThrow(
        ApiError.conflict(MESSAGES.AUTH.USER_ALREADY_EXISTS),
      );
    });

    it('should create user and return safe user with access token', async () => {
      const createdUser = {
        id: 'user-id',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed' as never);
      mockAuthRepository.createUser.mockResolvedValue(createdUser as never);
      mockJwt.sign.mockReturnValue('token123' as never);

      const result = await AuthService.register(registerData);

      expect(result.access).toBe('token123');
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).toMatchObject({ id: 'user-id', email: 'test@test.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', expect.any(Number));
    });
  });

  describe('login', () => {
    const loginData = { email: 'test@test.com', password: 'secret123' };

    it('should throw notFound if user does not exist', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(AuthService.login(loginData)).rejects.toThrow(
        ApiError.notFound(MESSAGES.AUTH.USER_NOT_FOUND),
      );
    });

    it('should throw unauthorized if password does not match', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(AuthService.login(loginData)).rejects.toThrow(
        ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS),
      );
    });

    it('should return safe user and access token on valid credentials', async () => {
      const user = {
        id: 'user-id',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepository.findByEmail.mockResolvedValue(user as never);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue('token123' as never);

      const result = await AuthService.login(loginData);

      expect(result.access).toBe('token123');
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).toMatchObject({ id: 'user-id', email: 'test@test.com' });
    });
  });
});
