import { prisma } from '@/configs';
import { CreateBoardDTO, GetBoardsQuery } from './board.dto';

type CreateBoardData = CreateBoardDTO & { createdBy: string };
type FindBoardsOptions = GetBoardsQuery & { userId?: string };

const buildWhere = ({ search, userId }: Pick<FindBoardsOptions, 'search' | 'userId'>) => ({
  deletedAt: null,
  ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  ...(userId && { members: { some: { userId } } }),
});

export const BoardRepository = {
  createBoard: (data: CreateBoardData) =>
    prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.boardMember.create({
        data: { boardId: board.id, userId: data.createdBy },
      });

      return board;
    }),

  findBoardById: (id: string) =>
    prisma.board.findUnique({
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
    }),

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
