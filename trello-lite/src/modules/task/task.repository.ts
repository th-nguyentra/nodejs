import { prisma } from '@/configs';
import { FindTasksOptions } from './task.dto';

const buildTaskWhere = ({
  boardId,
  assigneeId,
  status,
  startDate,
  endDate,
}: Pick<FindTasksOptions, 'boardId' | 'assigneeId' | 'status' | 'startDate' | 'endDate'>) => {
  const where: Record<string, unknown> = { deletedAt: null };

  if (boardId) where.boardId = boardId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (startDate || endDate) {
    const range: Record<string, Date> = {};
    if (startDate) {
      const from = new Date(startDate);
      from.setUTCHours(0, 0, 0, 0);
      range.gte = from;
    }
    if (endDate) {
      const to = new Date(endDate);
      to.setUTCHours(23, 59, 59, 999);
      range.lte = to;
    }

    where.dueDate = range;
  }

  return where;
};

export const TaskRepository = {
  findBoardIdsByUserId: (userId: string) =>
    prisma.boardMember.findMany({
      where: { userId },
      select: { boardId: true },
    }),

  findTasks: ({
    boardId,
    assigneeId,
    status,
    startDate,
    endDate,
    page,
    limit,
    sortBy,
    order,
  }: FindTasksOptions) => {
    const where = buildTaskWhere({ boardId, assigneeId, status, startDate, endDate });
    const skip = (page - 1) * limit;

    return Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          boardId: true,
          createdAt: true,
          updatedAt: true,
          assignee: { select: { id: true, username: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);
  },
};
