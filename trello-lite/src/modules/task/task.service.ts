import { Role } from '../../../generated/prisma/client';
import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils/api-error';
import { GetTasksQuery } from './task.dto';
import { TaskRepository } from './task.repository';

export const TaskService = {
  getTasks: async (query: GetTasksQuery, user: { id: string; role: Role }) => {
    const isAdmin = user.role === Role.ADMIN;

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
