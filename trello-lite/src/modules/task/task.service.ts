import { Role } from '../../../generated/prisma/client';
import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils/api-error';
import { BoardRepository } from '../board/board.repository';
import { CreateTaskDTO, GetTasksQuery } from './task.dto';
import { TaskRepository } from './task.repository';

export const TaskService = {
  createTask: async (data: CreateTaskDTO, user: { id: string; role: Role }) => {
    const isAdmin = user.role === Role.ADMIN;

    // Ensure the board exists
    const board = await BoardRepository.findBoardById(data.boardId);
    if (!board) throw ApiError.notFound(MESSAGES.BOARD.NOT_FOUND);

    // Members can only create tasks on boards they belong to
    if (!isAdmin) {
      const membership = await TaskRepository.isBoardMember(data.boardId, user.id);
      if (!membership) throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);
    }

    // Assignee must be a member of the board
    if (data.assigneeId) {
      const assigneeMembership = await TaskRepository.isBoardMember(data.boardId, data.assigneeId);
      if (!assigneeMembership) throw ApiError.badRequest(MESSAGES.TASK.ASSIGNEE_NOT_MEMBER);
    }

    return TaskRepository.createTask({ ...data, createdBy: user.id });
  },

  getTasks: async (query: GetTasksQuery, user: { id: string; role: Role }) => {
    const isAdmin = user.role === Role.ADMIN;

    // Members must filter by a specific board they belong to
    if (!isAdmin) {
      if (!query.boardId) {
        throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);
      }

      const memberships = await TaskRepository.findBoardIdsByUserId(user.id);
      const allowedBoardIds = memberships.map((member) => member.boardId);

      if (!allowedBoardIds.includes(query.boardId)) {
        throw ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED);
      }
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
