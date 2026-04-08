import { Board, PaginatedResponse } from '@/types';
import { apiClient } from './client';

export interface GetBoardsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const boardsApi = {
  getBoards: (params?: GetBoardsParams) =>
    apiClient.get<PaginatedResponse<Board>>('/boards', { params }).then((r) => r.data),

  getBoardById: (id: string) =>
    apiClient.get<Board>(`/boards/${id}`).then((r) => r.data),

  createBoard: (data: { name: string; description?: string }) =>
    apiClient.post<Board>('/boards', data).then((r) => r.data),

  updateBoard: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<Board>(`/boards/${id}`, data).then((r) => r.data),

  deleteBoard: (id: string) =>
    apiClient.delete(`/boards/${id}`),
};
