import { z } from 'zod';
import { DEFAULT_PAGE, MAX_LIMIT } from '@/constants';
import { TaskStatus } from 'generated/prisma/client';

export const getTasksQuerySchema = z.object({
  boardId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(Object.values(TaskStatus)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
  sortBy: z.enum(['createdAt', 'dueDate']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type FindTasksOptions = GetTasksQuery;
