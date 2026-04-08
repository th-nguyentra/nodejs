import { InvitationStatus } from '../../../generated/prisma/client';
import { prisma } from '@/configs';
import { CreateInvitationData } from './invitation.dto';

export const InvitationRepository = {
  findPendingInvitation: (email: string, boardId: string) =>
    prisma.invitation.findFirst({
      where: {
        email,
        boardId,
        status: InvitationStatus.PENDING,
      },
    }),

  createInvitation: (data: CreateInvitationData) =>
    prisma.invitation.create({
      data: {
        email: data.email,
        boardId: data.boardId,
        invitedBy: data.invitedBy,
        token: data.token,
        status: InvitationStatus.PENDING,
      },
      select: {
        board: { select: { name: true } },
        sender: { select: { username: true } },
      },
    }),
};
