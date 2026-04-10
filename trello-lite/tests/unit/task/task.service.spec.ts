import { TaskService } from '@/modules/task/task.service';
import { TaskRepository } from '@/modules/task/task.repository';
import { BoardRepository } from '@/modules/board/board.repository';
import { ApiError } from '@/utils';
import { MESSAGES } from '@/constants';
import { Role, TaskStatus } from 'generated/prisma/client';

jest.mock('@/modules/task/task.repository');
jest.mock('@/modules/board/board.repository');

const mockTaskRepository = jest.mocked(TaskRepository);
const mockBoardRepository = jest.mocked(BoardRepository);

const adminUser = { id: 'admin-id', role: Role.ADMIN };
const memberUser = { id: 'member-id', role: Role.MEMBER };

const mockTask = {
  id: 'task-id',
  boardId: 'board-id',
  assigneeId: 'member-id',
  title: 'Test Task',
  status: TaskStatus.TODO,
};

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const createData = { boardId: 'board-id', title: 'Task', status: TaskStatus.TODO };

    it('should throw notFound if board does not exist', async () => {
      mockBoardRepository.boardExists.mockResolvedValue(null);

      await expect(TaskService.createTask(createData, adminUser)).rejects.toThrow(
        ApiError.notFound(MESSAGES.BOARD.NOT_FOUND),
      );
    });

    it('should throw forbidden if member is not on the board', async () => {
      mockBoardRepository.boardExists.mockResolvedValue({ id: 'board-id' } as never);
      mockBoardRepository.isBoardMember.mockResolvedValue(null);

      await expect(TaskService.createTask(createData, memberUser)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED),
      );
    });

    it('should throw badRequest if assignee is not a board member', async () => {
      const dataWithAssignee = { ...createData, assigneeId: 'other-user-id' };
      mockBoardRepository.boardExists.mockResolvedValue({ id: 'board-id' } as never);
      // Admin user bypasses membership check for self, but assignee check still runs
      mockBoardRepository.isBoardMember.mockResolvedValue(null);

      await expect(TaskService.createTask(dataWithAssignee, adminUser)).rejects.toThrow(
        ApiError.badRequest(MESSAGES.TASK.ASSIGNEE_NOT_MEMBER),
      );
    });

    it('should create task for admin without membership check', async () => {
      const created = { ...mockTask, id: 'new-task' };
      mockBoardRepository.boardExists.mockResolvedValue({ id: 'board-id' } as never);
      mockTaskRepository.createTask.mockResolvedValue(created as never);

      const result = await TaskService.createTask(createData, adminUser);

      expect(result).toEqual(created);
      expect(TaskRepository.createTask).toHaveBeenCalledWith({
        ...createData,
        createdBy: 'admin-id',
      });
    });

    it('should create task for board member', async () => {
      const created = { ...mockTask, id: 'new-task' };
      mockBoardRepository.boardExists.mockResolvedValue({ id: 'board-id' } as never);
      mockBoardRepository.isBoardMember.mockResolvedValue({ id: 'bm-id' } as never);
      mockTaskRepository.createTask.mockResolvedValue(created as never);

      const result = await TaskService.createTask(createData, memberUser);

      expect(result).toEqual(created);
    });
  });

  describe('updateTask', () => {
    it('should throw notFound if task does not exist', async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(null);

      await expect(
        TaskService.updateTask('task-id', { title: 'New Title' }, adminUser),
      ).rejects.toThrow(ApiError.notFound(MESSAGES.TASK.NOT_FOUND));
    });

    it('should throw forbidden if non-admin non-assignee tries to change status', async () => {
      const otherMember = { id: 'other-member', role: Role.MEMBER };
      mockTaskRepository.findTaskById.mockResolvedValue(mockTask as never);
      mockBoardRepository.isBoardMember.mockResolvedValue({ id: 'bm-id' } as never);

      await expect(
        TaskService.updateTask('task-id', { status: TaskStatus.DONE }, otherMember),
      ).rejects.toThrow(ApiError.forbidden(MESSAGES.TASK.STATUS_CHANGE_FORBIDDEN));
    });

    it('should allow assignee to change status', async () => {
      const updated = { ...mockTask, status: TaskStatus.DONE };
      mockTaskRepository.findTaskById.mockResolvedValue(mockTask as never);
      mockBoardRepository.isBoardMember.mockResolvedValue({ id: 'bm-id' } as never);
      mockTaskRepository.updateTask.mockResolvedValue(updated as never);

      const result = await TaskService.updateTask(
        'task-id',
        { status: TaskStatus.DONE },
        memberUser,
      );

      expect(result).toEqual(updated);
    });

    it('should allow admin to change status regardless of assignment', async () => {
      const updated = { ...mockTask, status: TaskStatus.DONE };
      mockTaskRepository.findTaskById.mockResolvedValue(mockTask as never);
      mockTaskRepository.updateTask.mockResolvedValue(updated as never);

      const result = await TaskService.updateTask(
        'task-id',
        { status: TaskStatus.DONE },
        adminUser,
      );

      expect(result).toEqual(updated);
    });
  });

  describe('deleteTask', () => {
    it('should throw forbidden if user is not admin', async () => {
      await expect(TaskService.deleteTask('task-id', memberUser)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.FORBIDDEN),
      );
    });

    it('should throw notFound if task does not exist', async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(null);

      await expect(TaskService.deleteTask('task-id', adminUser)).rejects.toThrow(
        ApiError.notFound(MESSAGES.TASK.NOT_FOUND),
      );
    });

    it('should delete task if admin and task exists', async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(mockTask as never);
      mockTaskRepository.deleteTask.mockResolvedValue(undefined as never);

      await expect(TaskService.deleteTask('task-id', adminUser)).resolves.toBeUndefined();
      expect(TaskRepository.deleteTask).toHaveBeenCalledWith('task-id');
    });
  });

  describe('getTaskById', () => {
    it('should throw notFound if task does not exist', async () => {
      mockTaskRepository.findTaskDetail.mockResolvedValue(null);

      await expect(TaskService.getTaskById('task-id', adminUser)).rejects.toThrow(
        ApiError.notFound(MESSAGES.TASK.NOT_FOUND),
      );
    });

    it('should throw forbidden if non-admin is not a board member', async () => {
      mockTaskRepository.findTaskDetail.mockResolvedValue(mockTask as never);
      mockBoardRepository.isBoardMember.mockResolvedValue(null);

      await expect(TaskService.getTaskById('task-id', memberUser)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED),
      );
    });

    it('should return task for admin without membership check', async () => {
      mockTaskRepository.findTaskDetail.mockResolvedValue(mockTask as never);

      const result = await TaskService.getTaskById('task-id', adminUser);

      expect(result).toEqual(mockTask);
      expect(BoardRepository.isBoardMember).not.toHaveBeenCalled();
    });

    it('should return task for board member', async () => {
      mockTaskRepository.findTaskDetail.mockResolvedValue(mockTask as never);
      mockBoardRepository.isBoardMember.mockResolvedValue({ id: 'bm-id' } as never);

      const result = await TaskService.getTaskById('task-id', memberUser);

      expect(result).toEqual(mockTask);
    });
  });

  describe('getTasks', () => {
    const query = { page: 1, limit: 10, sortBy: 'createdAt' as const, order: 'desc' as const };

    it('should throw forbidden if non-admin provides no boardId', async () => {
      await expect(TaskService.getTasks(query, memberUser)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED),
      );
    });

    it('should throw forbidden if non-admin is not a board member', async () => {
      mockBoardRepository.isBoardMember.mockResolvedValue(null);

      await expect(
        TaskService.getTasks({ ...query, boardId: 'board-id' }, memberUser),
      ).rejects.toThrow(ApiError.forbidden(MESSAGES.TASK.BOARD_ACCESS_DENIED));
    });

    it('should return paginated tasks for admin', async () => {
      mockTaskRepository.findTasks.mockResolvedValue([[mockTask], 1] as never);

      const result = await TaskService.getTasks(query, adminUser);

      expect(result.data).toEqual([mockTask]);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('should return paginated tasks for board member', async () => {
      mockBoardRepository.isBoardMember.mockResolvedValue({ id: 'bm-id' } as never);
      mockTaskRepository.findTasks.mockResolvedValue([[mockTask], 1] as never);

      const result = await TaskService.getTasks({ ...query, boardId: 'board-id' }, memberUser);

      expect(result.data).toEqual([mockTask]);
    });

    it('should calculate totalPages correctly', async () => {
      mockTaskRepository.findTasks.mockResolvedValue([[], 21] as never);

      const result = await TaskService.getTasks(query, adminUser);

      expect(result.meta.totalPages).toBe(3);
    });
  });
});
