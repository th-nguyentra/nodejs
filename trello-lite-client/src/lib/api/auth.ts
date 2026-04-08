import { AuthResponse } from '@/types';
import { apiClient } from './client';

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),
};
