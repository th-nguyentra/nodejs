import { HTTP_CODE } from '@/constants';
import { Request, Response } from 'express';
import { getTasksQuerySchema } from './task.dto';
import { TaskService } from './task.service';

export const TaskController = {
  getTasks: async (req: Request, res: Response) => {
    const query = getTasksQuerySchema.parse(req.query);
    const result = await TaskService.getTasks(query, req.user!);

    res.status(HTTP_CODE.OK).json(result);
  },
};
