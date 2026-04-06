import { prisma } from '@/configs';
import { GetBoardsQuery } from './board.dto';

type FindBoardsOptions = GetBoardsQuery & { userId?: string };

const buildWhere = ({ search, userId }: Pick<FindBoardsOptions, 'search' | 'userId'>) => ({
  deletedAt: null,
  ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  ...(userId && { members: { some: { userId } } }),
});

export const BoardRepository = {
  findBoardById: (id: string) => {
    return prisma.board.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            user: { select: { id: true, username: true } },
          },
        },
      },
    });
  },

  findBoards: ({ search, page, limit, userId }: FindBoardsOptions) => {
    const where = buildWhere({ search, userId });
    const skip = (page - 1) * limit;

    return Promise.all([
      prisma.board.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.board.count({ where }),
    ]);
  },
};
