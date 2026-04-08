import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.email(),
  boardId: z.string().min(1),
});

export type CreateInvitationDTO = z.infer<typeof createInvitationSchema>;

export type CreateInvitationData = CreateInvitationDTO & {
  invitedBy: string;
  token: string;
};
