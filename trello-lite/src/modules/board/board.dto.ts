import { z } from 'zod';

export const getBoardsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type GetBoardsQuery = z.infer<typeof getBoardsQuerySchema>;
export type CreateBoardDTO = z.infer<typeof createBoardSchema>;
