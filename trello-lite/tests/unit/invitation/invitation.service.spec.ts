import { InvitationService } from '@/modules/invitation/invitation.service';
import { InvitationRepository } from '@/modules/invitation/invitation.repository';
import { BoardRepository } from '@/modules/board/board.repository';
import { AuthRepository } from '@/modules/auth/auth.repository';
import { ApiError } from '@/utils';
import { MESSAGES } from '@/constants';
import { InvitationStatus, Role } from 'generated/prisma/client';
import sgMail from '@sendgrid/mail';

jest.mock('@/modules/invitation/invitation.repository');
jest.mock('@/modules/board/board.repository');
jest.mock('@/modules/auth/auth.repository');
jest.mock('@sendgrid/mail', () => ({ setApiKey: jest.fn(), send: jest.fn() }));
jest.mock('crypto', () => ({ randomBytes: jest.fn(() => ({ toString: () => 'mock-token' })) }));

const mockInvitationRepository = jest.mocked(InvitationRepository);
const mockBoardRepository = jest.mocked(BoardRepository);
const mockAuthRepository = jest.mocked(AuthRepository);
const mockSgMail = jest.mocked(sgMail);

const adminUser = { id: 'admin-id', role: Role.ADMIN };
const memberUser = { id: 'member-id', role: Role.MEMBER };

const mockBoard = {
  id: 'board-id',
  name: 'Test Board',
  description: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [],
};

const mockInvitation = {
  id: 'inv-id',
  email: 'invite@test.com',
  boardId: 'board-id',
  status: InvitationStatus.PENDING,
  createdAt: new Date('2026-04-01'),
};

describe('InvitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvitation', () => {
    const createData = { email: 'invite@test.com', boardId: 'board-id' };

    it('should throw forbidden if user is not admin', async () => {
      await expect(InvitationService.createInvitation(createData, memberUser)).rejects.toThrow(
        ApiError.forbidden(MESSAGES.FORBIDDEN),
      );
    });

    it('should throw notFound if board does not exist', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(null);

      await expect(InvitationService.createInvitation(createData, adminUser)).rejects.toThrow(
        ApiError.notFound(MESSAGES.BOARD.NOT_FOUND),
      );
    });

    it('should throw conflict if invitation is already accepted', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);
      mockInvitationRepository.findActiveInvitation.mockResolvedValue({
        id: 'inv-id',
        status: InvitationStatus.ACCEPTED,
      } as never);

      await expect(InvitationService.createInvitation(createData, adminUser)).rejects.toThrow(
        ApiError.conflict(MESSAGES.INVITATION.ALREADY_MEMBER),
      );
    });

    it('should throw conflict if invitation is already pending', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);
      mockInvitationRepository.findActiveInvitation.mockResolvedValue({
        id: 'inv-id',
        status: InvitationStatus.PENDING,
      } as never);

      await expect(InvitationService.createInvitation(createData, adminUser)).rejects.toThrow(
        ApiError.conflict(MESSAGES.INVITATION.ALREADY_PENDING),
      );
    });

    it('should create invitation and send email', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);
      mockInvitationRepository.findActiveInvitation.mockResolvedValue(null);
      mockInvitationRepository.createInvitation.mockResolvedValue({
        board: { name: 'Test Board' },
        sender: { username: 'admin' },
      } as never);
      mockSgMail.send.mockResolvedValue(undefined as never);

      await InvitationService.createInvitation(createData, adminUser);

      expect(InvitationRepository.createInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'invite@test.com',
          boardId: 'board-id',
          invitedBy: 'admin-id',
        }),
      );
      expect(sgMail.send).toHaveBeenCalled();
    });

    it('should cancel invitation and throw internal error if email sending fails', async () => {
      mockBoardRepository.findBoardById.mockResolvedValue(mockBoard as never);
      mockInvitationRepository.findActiveInvitation.mockResolvedValue(null);
      mockInvitationRepository.createInvitation.mockResolvedValue({
        id: 'inv-1',
        board: { name: 'Test Board' },
        sender: { username: 'admin' },
      } as never);
      mockSgMail.send.mockRejectedValue(new Error('SendGrid error'));

      await expect(InvitationService.createInvitation(createData, adminUser)).rejects.toMatchObject(
        { statusCode: 500, message: MESSAGES.INVITATION.EMAIL_FAILED },
      );

      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        'inv-1',
        InvitationStatus.CANCELLED,
      );
    });
  });

  describe('acceptInvitation', () => {
    it('should throw notFound if invitation does not exist', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue(null);

      await expect(InvitationService.acceptInvitation('bad-token')).rejects.toThrow(
        ApiError.notFound(MESSAGES.INVITATION.NOT_FOUND),
      );
    });

    it('should throw badRequest if invitation is already accepted', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        status: InvitationStatus.ACCEPTED,
      } as never);

      await expect(InvitationService.acceptInvitation('token')).rejects.toThrow(
        ApiError.badRequest(MESSAGES.INVITATION.ALREADY_ACCEPTED),
      );
    });

    it('should throw badRequest if invitation is expired', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        status: InvitationStatus.EXPIRED,
      } as never);

      await expect(InvitationService.acceptInvitation('token')).rejects.toThrow(
        ApiError.badRequest(MESSAGES.INVITATION.EXPIRED),
      );
    });

    it('should throw badRequest if invitation is cancelled', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        status: InvitationStatus.CANCELLED,
      } as never);

      await expect(InvitationService.acceptInvitation('token')).rejects.toThrow(
        ApiError.badRequest(MESSAGES.INVITATION.INVALID),
      );
    });

    it('should mark as expired and throw if past expiry date', async () => {
      // createdAt is far in the past so it will always be expired
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        createdAt: new Date('2000-01-01'),
      } as never);
      mockInvitationRepository.updateStatus.mockResolvedValue(undefined as never);

      await expect(InvitationService.acceptInvitation('token')).rejects.toThrow(
        ApiError.badRequest(MESSAGES.INVITATION.EXPIRED),
      );

      expect(InvitationRepository.updateStatus).toHaveBeenCalledWith(
        'inv-id',
        InvitationStatus.EXPIRED,
      );
    });

    it('should return requiresRegistration if user does not have an account', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        createdAt: new Date(),
      } as never);
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      const result = await InvitationService.acceptInvitation('token');

      expect(result).toEqual({
        requiresRegistration: true,
        email: 'invite@test.com',
        boardId: 'board-id',
      });
    });

    it('should mark invitation accepted and return boardId if user is already a member', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        createdAt: new Date(),
      } as never);
      mockAuthRepository.findByEmail.mockResolvedValue({ id: 'user-id' } as never);
      mockInvitationRepository.findBoardMember.mockResolvedValue({ userId: 'user-id' } as never);
      mockInvitationRepository.updateStatus.mockResolvedValue(undefined as never);

      const result = await InvitationService.acceptInvitation('token');

      expect(result).toEqual({ boardId: 'board-id' });
      expect(InvitationRepository.updateStatus).toHaveBeenCalledWith(
        'inv-id',
        InvitationStatus.ACCEPTED,
      );
    });

    it('should accept invitation and return boardId for new user', async () => {
      mockInvitationRepository.findByToken.mockResolvedValue({
        ...mockInvitation,
        createdAt: new Date(),
      } as never);
      mockAuthRepository.findByEmail.mockResolvedValue({ id: 'user-id' } as never);
      mockInvitationRepository.findBoardMember.mockResolvedValue(null);
      mockInvitationRepository.acceptInvitation.mockResolvedValue(undefined as never);

      const result = await InvitationService.acceptInvitation('token');

      expect(result).toEqual({ boardId: 'board-id' });
      expect(InvitationRepository.acceptInvitation).toHaveBeenCalledWith(
        'inv-id',
        'user-id',
        'board-id',
      );
    });
  });
});
