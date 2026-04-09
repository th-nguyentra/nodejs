import { Role } from '../../../generated/prisma/client';
import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils/api-error';
import { BoardRepository } from '../board/board.repository';
import { CreateTaskDTO, GetTasksQuery, UpdateTaskDTO } from './task.dto';
import { TaskRepository } from './task.repository';

const validateBoardAccess = async (
  boardId: string,
  user: { id: string; role: Role },
  assigneeId?: string | null,
) => {
  const checkUser =
    user.role !== Role.ADMIN ? BoardRepository.isBoardMember(boardId, user.id) : null;
  const checkAssignee = assigneeId ? BoardRepository.isBoardMember(boardId, assigneeId) : null;

  const [membership, assigneeMembership] = await Promise.all([checkUser, checkAssignee]);

  if (checkUser && !membership) throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);
  if (checkAssignee && !assigneeMembership)
    throw ApiError.badRequest(MESSAGES.TASK.ASSIGNEE_NOT_MEMBER);
};

export const TaskService = {
  createTask: async (data: CreateTaskDTO, user: { id: string; role: Role }) => {
    const board = await BoardRepository.boardExists(data.boardId);
    if (!board) throw ApiError.notFound(MESSAGES.BOARD.NOT_FOUND);

    await validateBoardAccess(data.boardId, user, data.assigneeId);

    return TaskRepository.createTask({ ...data, createdBy: user.id });
  },

  updateTask: async (taskId: string, data: UpdateTaskDTO, user: { id: string; role: Role }) => {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) throw ApiError.notFound(MESSAGES.TASK.NOT_FOUND);

    await validateBoardAccess(task.boardId, user, data.assigneeId);

    if (data.status && user.role !== Role.ADMIN && user.id !== task.assigneeId) {
      throw ApiError.forbidden(MESSAGES.TASK.STATUS_CHANGE_FORBIDDEN);
    }

    return TaskRepository.updateTask(taskId, data);
  },

  deleteTask: async (taskId: string, user: { id: string; role: Role }) => {
    if (user.role !== Role.ADMIN) throw ApiError.forbidden(MESSAGES.FORBIDDEN);

    const task = await TaskRepository.findTaskById(taskId);
    if (!task) throw ApiError.notFound(MESSAGES.TASK.NOT_FOUND);

    await TaskRepository.deleteTask(taskId);
  },

  getTaskById: async (taskId: string, user: { id: string; role: Role }) => {
    const task = await TaskRepository.findTaskDetail(taskId);
    if (!task) throw ApiError.notFound(MESSAGES.TASK.NOT_FOUND);

    if (user.role !== Role.ADMIN) {
      const membership = await BoardRepository.isBoardMember(task.boardId, user.id);
      if (!membership) throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);
    }

    return task;
  },

  getTasks: async (query: GetTasksQuery, user: { id: string; role: Role }) => {
    const isAdmin = user.role === Role.ADMIN;

    if (!isAdmin) {
      if (!query.boardId) throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);

      const membership = await BoardRepository.isBoardMember(query.boardId, user.id);
      if (!membership) throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);
    }

    const [tasks, total] = await TaskRepository.findTasks(query);
    const { page, limit } = query;

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
