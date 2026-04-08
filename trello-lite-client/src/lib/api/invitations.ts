import { apiClient } from './client';

export const invitationsApi = {
  createInvitation: (data: { email: string; boardId: string }) =>
    apiClient.post('/invitations', data),

  acceptInvitation: (token: string) =>
    apiClient
      .get<
        | { boardId: string }
        | { requiresRegistration: true; email: string; boardId: string }
      >('/invitations/accept', { params: { token } })
      .then((r) => r.data),
};
