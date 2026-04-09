import { PaginatedResponse, Task, TaskStatus } from '@/types';
import { apiClient } from './client';

export interface GetTasksParams {
  boardId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  boardId: string;
  assigneeId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export const tasksApi = {
  getTasks: (params?: GetTasksParams) =>
    apiClient.get<PaginatedResponse<Task>>('/tasks', { params }).then((r) => r.data),
  createTask: (data: CreateTaskData) =>
    apiClient.post<Task>('/tasks', data).then((r) => r.data),
  updateTask: (id: string, data: UpdateTaskData) =>
    apiClient.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),
  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`).then((r) => r.data),
};
