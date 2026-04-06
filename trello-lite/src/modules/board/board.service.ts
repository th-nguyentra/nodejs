import { Role } from '../../../generated/prisma/client';
import { GetBoardsQuery } from './board.dto';
import { BoardRepository } from './board.repository';

export const BoardService = {
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
