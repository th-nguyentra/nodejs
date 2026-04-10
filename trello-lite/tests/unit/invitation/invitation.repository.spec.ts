import { prisma } from '@/configs';
import { InvitationRepository } from '@/modules/invitation/invitation.repository';
import { InvitationStatus } from 'generated/prisma/client';

jest.mock('@/configs', () => ({
  prisma: {
    invitation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    boardMember: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('InvitationRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findActiveInvitation', () => {
    it('should query PENDING or ACCEPTED status for given email + boardId', async () => {
      mockPrisma.invitation.findFirst.mockResolvedValue(null);

      await InvitationRepository.findActiveInvitation('test@test.com', 'board-id');

      expect(mockPrisma.invitation.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'test@test.com',
          boardId: 'board-id',
          status: { in: [InvitationStatus.PENDING, InvitationStatus.ACCEPTED] },
        },
        select: { id: true, status: true },
      });
    });
  });

  describe('createInvitation', () => {
    it('should create invitation with PENDING status', async () => {
      mockPrisma.invitation.create.mockResolvedValue({
        board: { name: 'Board' },
        sender: { username: 'admin' },
      } as never);

      await InvitationRepository.createInvitation({
        email: 'test@test.com',
        boardId: 'board-id',
        invitedBy: 'admin-id',
        token: 'token123',
      });

      expect(mockPrisma.invitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@test.com',
            boardId: 'board-id',
            invitedBy: 'admin-id',
            token: 'token123',
            status: InvitationStatus.PENDING,
          }),
        }),
      );
    });
  });

  describe('findByToken', () => {
    it('should call prisma.invitation.findUnique with token', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await InvitationRepository.findByToken('some-token');

      expect(mockPrisma.invitation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { token: 'some-token' } }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update invitation status by id', async () => {
      mockPrisma.invitation.update.mockResolvedValue({} as never);

      await InvitationRepository.updateStatus('inv-id', InvitationStatus.ACCEPTED);

      expect(mockPrisma.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv-id' },
        data: { status: InvitationStatus.ACCEPTED },
      });
    });
  });

  describe('findBoardMember', () => {
    it('should call prisma.boardMember.findUnique with composite key', async () => {
      mockPrisma.boardMember.findUnique.mockResolvedValue(null);

      await InvitationRepository.findBoardMember('board-id', 'user-id');

      expect(mockPrisma.boardMember.findUnique).toHaveBeenCalledWith({
        where: { boardId_userId: { boardId: 'board-id', userId: 'user-id' } },
        select: { userId: true },
      });
    });
  });

  describe('acceptInvitation', () => {
    it('should run a transaction to upsert board member and accept invitation', async () => {
      mockPrisma.$transaction.mockResolvedValue([] as never);

      await InvitationRepository.acceptInvitation('inv-id', 'user-id', 'board-id');

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.anything(), // boardMember.upsert
          expect.anything(), // invitation.update
        ]),
      );
    });
  });
});
