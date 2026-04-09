import { prisma } from '@/configs';
import { CreateTaskData, FindTasksOptions, UpdateTaskDTO } from './task.dto';

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

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  boardId: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, username: true } },
};

export const TaskRepository = {
  createTask: (data: CreateTaskData) =>
    prisma.task.create({
      data: {
        boardId: data.boardId,
        title: data.title,
        description: data.description,
        status: data.status,
        assigneeId: data.assigneeId,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        createdBy: data.createdBy,
      },
      select: TASK_SELECT,
    }),

  findTaskById: (id: string) =>
    prisma.task.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, boardId: true, assigneeId: true },
    }),

  findTaskDetail: (id: string) =>
    prisma.task.findUnique({
      where: { id, deletedAt: null },
      select: {
        ...TASK_SELECT,
        creator: { select: { id: true, username: true } },
      },
    }),

  updateTask: (id: string, data: UpdateTaskDTO) =>
    prisma.task.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate,
      },
      select: TASK_SELECT,
    }),

  deleteTask: (id: string) =>
    prisma.task.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    }),

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
        select: TASK_SELECT,
      }),
      prisma.task.count({ where }),
    ]);
  },
};
