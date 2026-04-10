import { prisma } from '@/configs';
import { AuthRepository } from '@/modules/auth/auth.repository';

jest.mock('@/configs', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('AuthRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findByEmail', () => {
    it('should call prisma.user.findUnique with email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@a.com' } as never);

      const result = await AuthRepository.findByEmail('a@a.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@a.com' } });
      expect(result).toEqual({ id: '1', email: 'a@a.com' });
    });

    it('should return null when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await AuthRepository.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('should call prisma.user.findFirst with OR condition', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await AuthRepository.findByUsernameOrEmail('user', 'a@a.com');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ username: 'user' }, { email: 'a@a.com' }] },
      });
    });
  });

  describe('createUser', () => {
    it('should call prisma.user.create with provided data', async () => {
      const data = { email: 'a@a.com', username: 'user', password: 'hashed' };
      mockPrisma.user.create.mockResolvedValue({ id: '1', ...data } as never);

      const result = await AuthRepository.createUser(data);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data });
      expect(result).toMatchObject({ id: '1', email: 'a@a.com' });
    });
  });
});
