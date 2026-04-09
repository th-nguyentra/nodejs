import { prisma } from '@/configs';
import { InvitationStatus } from '../../../generated/prisma/enums';
import { BoardWhereFilter, CreateBoardData, FindBoardsOptions, UpdateBoardDTO } from './board.dto';
import { QueryMode, SortOrder } from '@/constants';

const buildBoardWhere = ({ search, userId }: BoardWhereFilter) => ({
  deletedAt: null,
  ...(search && { name: { contains: search, mode: QueryMode.insensitive } }),
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

  updateBoard: (id: string, data: UpdateBoardDTO) =>
    prisma.board.update({
      where: { id, deletedAt: null },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
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

  deleteBoard: (id: string) =>
    prisma.$transaction([
      prisma.board.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      }),
      prisma.invitation.updateMany({
        where: { boardId: id, status: InvitationStatus.PENDING },
        data: { status: InvitationStatus.CANCELLED },
      }),
      prisma.task.updateMany({
        where: { boardId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      }),
    ]),

  boardExists: (id: string) =>
    prisma.board.findUnique({ where: { id, deletedAt: null }, select: { id: true } }),

  isBoardMember: (boardId: string, userId: string) =>
    prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: { id: true },
    }),

  findBoards: ({ search, page, limit, userId }: FindBoardsOptions) => {
    const where = buildBoardWhere({ search, userId });
    const skip = (page - 1) * limit;

    return Promise.all([
      prisma.board.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: SortOrder.desc },
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
