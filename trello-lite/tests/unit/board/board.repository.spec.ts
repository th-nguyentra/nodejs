import { prisma } from '@/configs';
import { BoardRepository } from '@/modules/board/board.repository';

jest.mock('@/configs', () => ({
  prisma: {
    board: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    boardMember: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    invitation: { updateMany: jest.fn() },
    task: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));
const mockPrisma = jest.mocked(prisma);

describe('BoardRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createBoard', () => {
    it('should run a transaction and create board then add creator as member', async () => {
      const board = { id: 'board-id', name: 'Board' };
      const mockTx = {
        board: { create: jest.fn().mockResolvedValue(board) },
        boardMember: { create: jest.fn().mockResolvedValue({}) },
      };
      mockPrisma.$transaction.mockImplementation((fn) => fn(mockTx as never));

      const result = await BoardRepository.createBoard({ name: 'Board', createdBy: 'user-id' });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockTx.board.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Board', createdBy: 'user-id' }),
        }),
      );
      expect(mockTx.boardMember.create).toHaveBeenCalledWith({
        data: { boardId: 'board-id', userId: 'user-id' },
      });
      expect(result).toEqual(board);
    });
  });

  describe('findBoardById', () => {
    it('should call prisma.board.findUnique with id and deletedAt: null', async () => {
      mockPrisma.board.findUnique.mockResolvedValue(null);

      await BoardRepository.findBoardById('board-id');

      expect(mockPrisma.board.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'board-id', deletedAt: null } }),
      );
    });
  });

  describe('updateBoard', () => {
    it('should call prisma.board.update with correct where and data', async () => {
      mockPrisma.board.update.mockResolvedValue({ id: 'board-id', name: 'New Name' } as never);

      await BoardRepository.updateBoard('board-id', { name: 'New Name' });

      expect(mockPrisma.board.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'board-id', deletedAt: null },
          data: { name: 'New Name' },
        }),
      );
    });
  });

  describe('deleteBoard', () => {
    it('should run a batch transaction for soft-delete, cancel invitations, and delete tasks', async () => {
      mockPrisma.$transaction.mockResolvedValue([] as never);

      await BoardRepository.deleteBoard('board-id');

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.anything(), // board soft-delete
          expect.anything(), // invitations cancel
          expect.anything(), // tasks soft-delete
        ]),
      );
    });
  });

  describe('boardExists', () => {
    it('should call prisma.board.findUnique selecting only id', async () => {
      mockPrisma.board.findUnique.mockResolvedValue(null);

      await BoardRepository.boardExists('board-id');

      expect(mockPrisma.board.findUnique).toHaveBeenCalledWith({
        where: { id: 'board-id', deletedAt: null },
        select: { id: true },
      });
    });
  });

  describe('isBoardMember', () => {
    it('should call prisma.boardMember.findUnique with composite key', async () => {
      mockPrisma.boardMember.findUnique.mockResolvedValue(null);

      await BoardRepository.isBoardMember('board-id', 'user-id');

      expect(mockPrisma.boardMember.findUnique).toHaveBeenCalledWith({
        where: { boardId_userId: { boardId: 'board-id', userId: 'user-id' } },
        select: { id: true },
      });
    });
  });

  describe('findBoards', () => {
    it('should run findMany and count in parallel', async () => {
      mockPrisma.board.findMany.mockResolvedValue([] as never);
      mockPrisma.board.count.mockResolvedValue(0);

      const result = await BoardRepository.findBoards({ page: 1, limit: 10 });

      expect(mockPrisma.board.findMany).toHaveBeenCalled();
      expect(mockPrisma.board.count).toHaveBeenCalled();
      expect(result).toEqual([[], 0]);
    });

    it('should filter by userId when provided', async () => {
      mockPrisma.board.findMany.mockResolvedValue([] as never);
      mockPrisma.board.count.mockResolvedValue(0);

      await BoardRepository.findBoards({ page: 1, limit: 10, userId: 'user-id' });

      expect(mockPrisma.board.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ members: { some: { userId: 'user-id' } } }),
        }),
      );
    });

    it('should skip records based on page and limit', async () => {
      mockPrisma.board.findMany.mockResolvedValue([] as never);
      mockPrisma.board.count.mockResolvedValue(0);

      await BoardRepository.findBoards({ page: 3, limit: 5 });

      expect(mockPrisma.board.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });
});
