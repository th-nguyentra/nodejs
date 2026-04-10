import { Request, Response } from 'express';
import { TaskController } from '@/modules/task/task.controller';
import { TaskService } from '@/modules/task/task.service';
import { HTTP_CODE } from '@/constants';
import { Role, TaskStatus } from 'generated/prisma/client';

jest.mock('@/modules/task/task.service');

const mockTaskService = jest.mocked(TaskService);

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const adminUser = { id: 'admin-id', role: Role.ADMIN };
const mockTask = {
  id: 'task-id',
  title: 'Task',
  status: TaskStatus.TODO,
  boardId: 'board-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TaskController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createTask', () => {
    it('should return 201 with created task', async () => {
      const req = {
        body: { boardId: 'board-id', title: 'Task' },
        user: adminUser,
      } as unknown as Request;
      const res = mockRes();
      mockTaskService.createTask.mockResolvedValue(mockTask as never);

      await TaskController.createTask(req, res);

      expect(TaskService.createTask).toHaveBeenCalledWith(
        { boardId: 'board-id', title: 'Task' },
        adminUser,
      );
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should return 200 with updated task', async () => {
      const req = {
        body: { title: 'Updated' },
        params: { taskId: 'task-id' },
        user: adminUser,
      } as unknown as Request;
      const res = mockRes();
      mockTaskService.updateTask.mockResolvedValue(mockTask as never);

      await TaskController.updateTask(req, res);

      expect(TaskService.updateTask).toHaveBeenCalledWith(
        'task-id',
        { title: 'Updated' },
        adminUser,
      );
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
    });
  });

  describe('deleteTask', () => {
    it('should return 204', async () => {
      const req = { params: { taskId: 'task-id' }, user: adminUser } as unknown as Request;
      const res = mockRes();
      mockTaskService.deleteTask.mockResolvedValue(undefined);

      await TaskController.deleteTask(req, res);

      expect(TaskService.deleteTask).toHaveBeenCalledWith('task-id', adminUser);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return 200 with task', async () => {
      const req = { params: { taskId: 'task-id' }, user: adminUser } as unknown as Request;
      const res = mockRes();
      mockTaskService.getTaskById.mockResolvedValue(mockTask as never);

      await TaskController.getTaskById(req, res);

      expect(TaskService.getTaskById).toHaveBeenCalledWith('task-id', adminUser);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('getTasks', () => {
    it('should return 200 with task list', async () => {
      const req = {
        query: { page: '1', limit: '20', sortBy: 'createdAt', order: 'desc' },
        user: adminUser,
      } as unknown as Request;
      const res = mockRes();
      const serviceResult = {
        data: [mockTask],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockTaskService.getTasks.mockResolvedValue(serviceResult as never);

      await TaskController.getTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
    });
  });
});
