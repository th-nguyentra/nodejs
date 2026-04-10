import { Request, Response } from 'express';
import { BoardController } from '@/modules/board/board.controller';
import { BoardService } from '@/modules/board/board.service';
import { HTTP_CODE } from '@/constants';
import { Role } from 'generated/prisma/client';

jest.mock('@/modules/board/board.service');

const mockBoardService = jest.mocked(BoardService);

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const adminUser = { id: 'admin-id', role: Role.ADMIN };
const mockBoard = {
  id: 'board-id',
  name: 'Board',
  description: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BoardController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createBoard', () => {
    it('should return 201 with created board', async () => {
      const req = { body: { name: 'Board' }, user: adminUser } as unknown as Request;
      const res = mockRes();
      mockBoardService.createBoard.mockResolvedValue(mockBoard as never);

      await BoardController.createBoard(req, res);

      expect(BoardService.createBoard).toHaveBeenCalledWith({ name: 'Board' }, adminUser);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockBoard);
    });
  });

  describe('updateBoard', () => {
    it('should return 200 with updated board', async () => {
      const req = {
        body: { name: 'New Name' },
        params: { id: 'board-id' },
        user: adminUser,
      } as unknown as Request;
      const res = mockRes();
      mockBoardService.updateBoard.mockResolvedValue(mockBoard as never);

      await BoardController.updateBoard(req, res);

      expect(BoardService.updateBoard).toHaveBeenCalledWith(
        'board-id',
        { name: 'New Name' },
        adminUser,
      );
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
    });
  });

  describe('deleteBoard', () => {
    it('should return 204', async () => {
      const req = { params: { id: 'board-id' }, user: adminUser } as unknown as Request;
      const res = mockRes();
      mockBoardService.deleteBoard.mockResolvedValue(undefined);

      await BoardController.deleteBoard(req, res);

      expect(BoardService.deleteBoard).toHaveBeenCalledWith('board-id', adminUser);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getBoards', () => {
    it('should return 200 with board list', async () => {
      const req = {
        query: { page: '1', limit: '10' },
        user: adminUser,
      } as unknown as Request;
      const res = mockRes();
      const serviceResult = {
        data: [mockBoard],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockBoardService.getBoards.mockResolvedValue(serviceResult as never);

      await BoardController.getBoards(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
    });
  });

  describe('getBoardById', () => {
    it('should return 200 with board', async () => {
      const req = { params: { id: 'board-id' }, user: adminUser } as unknown as Request;
      const res = mockRes();
      mockBoardService.getBoardById.mockResolvedValue(mockBoard as never);

      await BoardController.getBoardById(req, res);

      expect(BoardService.getBoardById).toHaveBeenCalledWith('board-id', adminUser);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
      expect(res.json).toHaveBeenCalledWith(mockBoard);
    });
  });
});
