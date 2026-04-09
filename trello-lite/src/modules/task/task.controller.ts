import { HTTP_CODE } from '@/constants';
import { Request, Response } from 'express';
import { createTaskSchema, getTasksQuerySchema, updateTaskSchema } from './task.dto';
import { TaskService } from './task.service';

export const TaskController = {
  createTask: async (req: Request, res: Response) => {
    const data = createTaskSchema.parse(req.body);
    const result = await TaskService.createTask(data, req.user!);

    res.status(HTTP_CODE.CREATED).json(result);
  },

  updateTask: async (req: Request, res: Response) => {
    const data = updateTaskSchema.parse(req.body);
    const result = await TaskService.updateTask(req.params.taskId as string, data, req.user!);

    res.status(HTTP_CODE.OK).json(result);
  },

  getTaskById: async (req: Request, res: Response) => {
    const result = await TaskService.getTaskById(req.params.taskId as string, req.user!);
    res.status(HTTP_CODE.OK).json(result);
  },

  getTasks: async (req: Request, res: Response) => {
    const query = getTasksQuerySchema.parse(req.query);
    const result = await TaskService.getTasks(query, req.user!);

    res.status(HTTP_CODE.OK).json(result);
  },
};
