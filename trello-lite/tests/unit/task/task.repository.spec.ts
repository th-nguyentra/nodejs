import { prisma } from '@/configs';
import { TaskRepository } from '@/modules/task/task.repository';
import { TaskStatus } from 'generated/prisma/client';

jest.mock('@/configs', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    boardMember: { findMany: jest.fn() },
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('TaskRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createTask', () => {
    it('should call prisma.task.create with correct data', async () => {
      const data = {
        boardId: 'board-id',
        title: 'Task',
        createdBy: 'user-id',
        status: TaskStatus.TODO,
      };
      mockPrisma.task.create.mockResolvedValue({ id: 'task-id', ...data } as never);

      await TaskRepository.createTask(data);

      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            boardId: 'board-id',
            title: 'Task',
            createdBy: 'user-id',
          }),
        }),
      );
    });

    it('should convert dueDate string to Date', async () => {
      mockPrisma.task.create.mockResolvedValue({} as never);

      await TaskRepository.createTask({
        boardId: 'b',
        title: 'T',
        createdBy: 'u',
        dueDate: '2026-12-31T00:00:00Z',
      });

      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dueDate: new Date('2026-12-31T00:00:00Z') }),
        }),
      );
    });
  });

  describe('findTaskById', () => {
    it('should call prisma.task.findUnique with id and deletedAt: null', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await TaskRepository.findTaskById('task-id');

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'task-id', deletedAt: null } }),
      );
    });
  });

  describe('findTaskDetail', () => {
    it('should include creator in select', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await TaskRepository.findTaskDetail('task-id');

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({ creator: expect.anything() }),
        }),
      );
    });
  });

  describe('updateTask', () => {
    it('should call prisma.task.update with correct where and data', async () => {
      mockPrisma.task.update.mockResolvedValue({} as never);

      await TaskRepository.updateTask('task-id', { title: 'New Title' });

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-id', deletedAt: null },
          data: expect.objectContaining({ title: 'New Title' }),
        }),
      );
    });

    it('should convert dueDate string to Date on update', async () => {
      mockPrisma.task.update.mockResolvedValue({} as never);

      await TaskRepository.updateTask('task-id', { dueDate: '2026-06-01T00:00:00Z' });

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dueDate: new Date('2026-06-01T00:00:00Z') }),
        }),
      );
    });
  });

  describe('deleteTask', () => {
    it('should soft-delete by setting deletedAt', async () => {
      mockPrisma.task.update.mockResolvedValue({} as never);

      await TaskRepository.deleteTask('task-id');

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-id', deletedAt: null },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('findTasks', () => {
    const baseQuery = { page: 1, limit: 10, sortBy: 'createdAt' as const, order: 'desc' as const };

    it('should run findMany and count in parallel', async () => {
      mockPrisma.task.findMany.mockResolvedValue([] as never);
      mockPrisma.task.count.mockResolvedValue(0);

      const result = await TaskRepository.findTasks(baseQuery);

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      expect(mockPrisma.task.count).toHaveBeenCalled();
      expect(result).toEqual([[], 0]);
    });

    it('should filter by boardId when provided', async () => {
      mockPrisma.task.findMany.mockResolvedValue([] as never);
      mockPrisma.task.count.mockResolvedValue(0);

      await TaskRepository.findTasks({ ...baseQuery, boardId: 'board-id' });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ boardId: 'board-id' }) }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.task.findMany.mockResolvedValue([] as never);
      mockPrisma.task.count.mockResolvedValue(0);

      await TaskRepository.findTasks({ ...baseQuery, status: TaskStatus.DONE });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: TaskStatus.DONE }) }),
      );
    });

    it('should apply correct skip based on page and limit', async () => {
      mockPrisma.task.findMany.mockResolvedValue([] as never);
      mockPrisma.task.count.mockResolvedValue(0);

      await TaskRepository.findTasks({ ...baseQuery, page: 2, limit: 5 });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });
});
