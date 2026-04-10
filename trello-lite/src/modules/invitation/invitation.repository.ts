import { InvitationStatus } from '../../../generated/prisma/client';
import { prisma } from '@/configs';
import { CreateInvitationData } from './invitation.dto';

export const InvitationRepository = {
  findActiveInvitation: (email: string, boardId: string) =>
    prisma.invitation.findFirst({
      where: {
        email,
        boardId,
        status: { in: [InvitationStatus.PENDING, InvitationStatus.ACCEPTED] },
      },
      select: { id: true, status: true },
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
        id: true,
        board: { select: { name: true } },
        sender: { select: { username: true } },
      },
    }),

  findByToken: (token: string) =>
    prisma.invitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        boardId: true,
        status: true,
        createdAt: true,
      },
    }),

  updateStatus: (id: string, status: InvitationStatus) =>
    prisma.invitation.update({ where: { id }, data: { status } }),

  findBoardMember: (boardId: string, userId: string) =>
    prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: { userId: true },
    }),

  acceptInvitation: (invitationId: string, userId: string, boardId: string) =>
    prisma.$transaction([
      prisma.boardMember.upsert({
        where: { boardId_userId: { boardId, userId } },
        create: { boardId, userId },
        update: {},
      }),
      prisma.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.ACCEPTED },
      }),
    ]),
};
