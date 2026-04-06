import { HTTP_CODE } from '@/constants';
import { Request, Response } from 'express';
import { createBoardSchema, getBoardsQuerySchema } from './board.dto';
import { BoardService } from './board.service';

export const BoardController = {
  createBoard: async (req: Request, res: Response) => {
    const data = createBoardSchema.parse(req.body);
    const result = await BoardService.createBoard(data, req.user!);

    res.status(HTTP_CODE.CREATED).json(result);
  },

  getBoards: async (req: Request, res: Response) => {
    const query = getBoardsQuerySchema.parse(req.query);
    const result = await BoardService.getBoards(query, req.user!);

    res.status(HTTP_CODE.OK).json(result);
  },

  getBoardById: async (req: Request, res: Response) => {
    const result = await BoardService.getBoardById(req.params.id as string, req.user!);
    res.status(HTTP_CODE.OK).json(result);
  },
};
