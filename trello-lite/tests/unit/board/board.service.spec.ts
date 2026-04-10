import { BoardService } from '@/modules/board/board.service';
import { BoardRepository } from '@/modules/board/board.repository';
import { ApiError } from '@/utils';
import { MESSAGES } from '@/constants';
import { Role } from 'generated/prisma/client';

jest.mock('@/modules/board/board.repository');

const mockBoardRepository = jest.mocked(BoardRepository);

const adminUser = { id: 'admin-id', role: Role.ADMIN };
const memberUser = { id: 'member-id', role: Role.MEMBER };

const mockBoard = {
  id: 'board-id',
  name: 'Test Board',
  description: 'desc',
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [{ id: 'bm-id', user: { id: 'member-id', username: 'member' } }],
};

describe('BoardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBoard', () => {
    it('should throw forbidden if user is not admin', async () => {
      await expect(
        BoardService.createBoard({ name: 'Board', description: 'desc' }, memberUser),
      ).rejects.toThrow(ApiError.forbidden(MESSAGES.FORBIDDEN));
    });

    it('should create board if user is admin', async () => {
      const created = {
        id: 'board-id',
        name: 'Board',
        description: 'desc',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBoardRepository.createBoard.mockResolvedValue(created as never);

      const result = await BoardService.createBoard(
        { name: 'Board', description: 'desc' },
        adminUser,
      );

      expect(result).toEqual(created);
      expect(BoardRepository.createBoard).toHaveBeenCalledWith({
        name: 'Board',
        description: 'desc',
        createdBy: 'admin-id',
      });
    });
  });

  describe('updateBoard', () => {
    it('should throw forbidden if user is not admin', async () => {
      await expect(
        BoardService.updateBoard('board-id', { name: 'New Name' }, memberUser),
      ).rejects.toThrow(ApiError.forbidden(MESSAGES.FORBIDDEN));
    });

    it('should throw notFound if board does not exist', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(null);

      await expect(
        BoardService.updateBoard('board-id', { name: 'New Name' }, adminUser),
      ).rejects.toThrow(ApiError.notFound(MESSAGES.BOARD.NOT_FOUND));
    });

    it('should update board if admin and board exists', async () => {
      const updated = { ...mockBoard, name: 'New Name' };
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);
      mockBoardRepository.updateBoard.mockResolvedValue(updated as never);

      const result = await BoardService.updateBoard('board-id', { name: 'New Name' }, adminUser);

      expect(result).toEqual(updated);
      expect(BoardRepository.updateBoard).toHaveBeenCalledWith('board-id', { name: 'New Name' });
    });
  });

  describe('deleteBoard', () => {
    it('should throw forbidden if user is not admin', async () => {
      await expect(BoardService.deleteBoard('board-id', memberUser)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.FORBIDDEN),
      );
    });

    it('should throw notFound if board does not exist', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(null);

      await expect(BoardService.deleteBoard('board-id', adminUser)).rejects.toThrow(
        ApiError.notFound(MESSAGES.BOARD.NOT_FOUND),
      );
    });

    it('should delete board if admin and board exists', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);
      mockBoardRepository.deleteBoard.mockResolvedValue(undefined as never);

      await expect(BoardService.deleteBoard('board-id', adminUser)).resolves.toBeUndefined();
      expect(BoardRepository.deleteBoard).toHaveBeenCalledWith('board-id');
    });
  });

  describe('getBoardById', () => {
    it('should throw notFound if board does not exist', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(null);

      await expect(BoardService.getBoardById('board-id', adminUser)).rejects.toThrow(
        ApiError.notFound(MESSAGES.BOARD.NOT_FOUND),
      );
    });

    it('should throw forbidden if non-admin user is not a member', async () => {
      const nonMember = { id: 'other-id', role: Role.MEMBER };
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);

      await expect(BoardService.getBoardById('board-id', nonMember)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.BOARD.NOT_FOUND),
      );
    });

    it('should return board for admin even if not a member', async () => {
      const boardWithoutAdmin = { ...mockBoard, members: [] };
      mockBoardRepository.findBoardById.mockResolvedValue(boardWithoutAdmin as never);

      const result = await BoardService.getBoardById('board-id', adminUser);

      expect(result).toEqual(boardWithoutAdmin);
    });

    it('should return board for member', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);

      const result = await BoardService.getBoardById('board-id', memberUser);

      expect(result).toEqual(mockBoard);
    });
  });

  describe('getBoards', () => {
    const query = { page: 1, limit: 10 };

    it('should return paginated boards for admin without userId filter', async () => {
      mockBoardRepository.findBoards.mockResolvedValue([[mockBoard], 1] as never);

      const result = await BoardService.getBoards(query, adminUser);

      expect(BoardRepository.findBoards).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
      expect(result.data).toEqual([mockBoard]);
    });

    it('should filter boards by userId for non-admin users', async () => {
      mockBoardRepository.findBoards.mockResolvedValue([[mockBoard], 1] as never);

      await BoardService.getBoards(query, memberUser);

      expect(BoardRepository.findBoards).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        userId: 'member-id',
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockBoardRepository.findBoards.mockResolvedValue([[], 25] as never);

      const result = await BoardService.getBoards({ page: 1, limit: 10 }, adminUser);

      expect(result.meta.totalPages).toBe(3);
    });
  });
});
