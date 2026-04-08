export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  data: User;
  access: string;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; username: string };
  members?: BoardMember[];
}

export interface BoardMember {
  id: string;
  user: { id: string; username: string };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  assignee: { id: string; username: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
}
