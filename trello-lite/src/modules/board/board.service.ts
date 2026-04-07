import { Role } from '../../../generated/prisma/client';
import { CreateBoardDTO, GetBoardsQuery, UpdateBoardDTO } from './board.dto';
import { BoardRepository } from './board.repository';
import { ApiError } from '@/utils';
import { MESSAGES } from '@/constants';

export const BoardService = {
  createBoard: async (data: CreateBoardDTO, user: { id: string; role: Role }) => {
    if (user.role !== Role.ADMIN) throw ApiError.forbidden(MESSAGES.FORBIDDEN);

    return BoardRepository.createBoard({ ...data, createdBy: user.id });
  },

  updateBoard: async (id: string, data: UpdateBoardDTO, user: { id: string; role: Role }) => {
    if (user.role !== Role.ADMIN) throw ApiError.forbidden(MESSAGES.FORBIDDEN);

    const board = await BoardRepository.findBoardById(id);
    if (!board) throw ApiError.notFound(MESSAGES.BOARD.NOT_FOUND);

    return BoardRepository.updateBoard(id, data);
  },

  getBoardById: async (id: string, user: { id: string; role: Role }) => {
    const board = await BoardRepository.findBoardById(id);

    if (!board) throw ApiError.notFound(MESSAGES.BOARD.NOT_FOUND);

    const isMember = board.members.some((member) => member.user.id === user.id);
    if (user.role !== Role.ADMIN && !isMember) {
      throw ApiError.forbidden(MESSAGES.BOARD.NOT_FOUND);
    }

    return {
      id: board.id,
      name: board.name,
      description: board.description,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  },

  getBoards: async (query: GetBoardsQuery, user: { id: string; role: Role }) => {
    const isAdmin = user.role === Role.ADMIN;
    const [boards, total] = await BoardRepository.findBoards({
      ...query,
      ...(!isAdmin && { userId: user.id }),
    });
    const { page, limit } = query;

    return {
      data: boards,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
