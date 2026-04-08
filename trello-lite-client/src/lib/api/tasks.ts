import { PaginatedResponse, Task, TaskStatus } from '@/types';
import { apiClient } from './client';

export interface GetTasksParams {
  boardId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  dueDate?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const tasksApi = {
  getTasks: (params?: GetTasksParams) =>
    apiClient.get<PaginatedResponse<Task>>('/tasks', { params }).then((r) => r.data),
};
