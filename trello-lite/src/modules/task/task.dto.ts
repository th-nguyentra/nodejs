import { z } from 'zod';
import { DEFAULT_PAGE, MAX_LIMIT, SortOrder, TaskSortBy } from '@/constants';
import { TaskStatus } from 'generated/prisma/client';

export const createTaskSchema = z.object({
  boardId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(Object.values(TaskStatus)).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.iso.datetime().optional(),
});

export const getTasksQuerySchema = z.object({
  boardId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(Object.values(TaskStatus)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
  sortBy: z.enum(Object.values(TaskSortBy)).default(TaskSortBy.createdAt),
  order: z.enum(Object.values(SortOrder)).default(SortOrder.desc),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(Object.values(TaskStatus)).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type CreateTaskData = CreateTaskDTO & { createdBy: string };
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type FindTasksOptions = GetTasksQuery;
