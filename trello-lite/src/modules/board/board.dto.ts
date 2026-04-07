import { z } from 'zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '@/constants';

export const getBoardsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export type GetBoardsQuery = z.infer<typeof getBoardsQuerySchema>;
export type CreateBoardDTO = z.infer<typeof createBoardSchema>;
export type UpdateBoardDTO = z.infer<typeof updateBoardSchema>;

export type CreateBoardData = CreateBoardDTO & { createdBy: string };
export type FindBoardsOptions = GetBoardsQuery & { userId?: string };
export type BoardWhereFilter = {
  search?: string;
  userId?: string;
};
