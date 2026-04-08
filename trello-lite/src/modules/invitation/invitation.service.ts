import { env, logger } from '@/configs';
import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { InvitationStatus, Role } from '../../../generated/prisma/client';
import { AuthRepository } from '../auth/auth.repository';
import { BoardRepository } from '../board/board.repository';
import { CreateInvitationDTO } from './invitation.dto';
import { InvitationRepository } from './invitation.repository';
import { buildInvitationEmail } from './invitation.template';

sgMail.setApiKey(env.sendgrid.apiKey);

export const InvitationService = {
  createInvitation: async (data: CreateInvitationDTO, user: { id: string; role: Role }) => {
    if (user.role !== Role.ADMIN) throw ApiError.forbidden(MESSAGES.FORBIDDEN);

    // Verify board exists
    const board = await BoardRepository.findBoardById(data.boardId);
    if (!board) throw ApiError.notFound(MESSAGES.BOARD.NOT_FOUND);

    // Prevent re-inviting an existing member or duplicate pending invitation
    const activeInvitation = await InvitationRepository.findActiveInvitation(
      data.email,
      data.boardId,
    );
    if (activeInvitation?.status === InvitationStatus.ACCEPTED)
      throw ApiError.conflict(MESSAGES.INVITATION.ALREADY_MEMBER);
    if (activeInvitation?.status === InvitationStatus.PENDING)
      throw ApiError.conflict(MESSAGES.INVITATION.ALREADY_PENDING);

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    const invitation = await InvitationRepository.createInvitation({
      ...data,
      invitedBy: user.id,
      token,
    });

    // Send invite email via SendGrid
    const { subject, html } = buildInvitationEmail({
      senderUsername: invitation.sender.username,
      boardName: invitation.board.name,
      token,
    });

    try {
      await sgMail.send({ to: data.email, from: env.sendgrid.from, subject, html });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to send invitation email to ${data.email}: ${message}`);
    }
  },

  acceptInvitation: async (token: string) => {
    // Validate token and invitation status
    const invitation = await InvitationRepository.findByToken(token);
    if (!invitation) throw ApiError.notFound(MESSAGES.INVITATION.NOT_FOUND);

    if (invitation.status === InvitationStatus.ACCEPTED)
      throw ApiError.badRequest(MESSAGES.INVITATION.ALREADY_ACCEPTED);

    if (invitation.status === InvitationStatus.EXPIRED)
      throw ApiError.badRequest(MESSAGES.INVITATION.EXPIRED);

    if (invitation.status === InvitationStatus.CANCELLED)
      throw ApiError.badRequest(MESSAGES.INVITATION.INVALID);

    // Calculate expiration date based on creation date + configured expiration days
    const expiresAt = new Date(invitation.createdAt);
    expiresAt.setDate(expiresAt.getDate() + env.invitation.expiresInDays);

    if (new Date() > expiresAt) {
      await InvitationRepository.updateStatus(invitation.id, InvitationStatus.EXPIRED);
      throw ApiError.badRequest(MESSAGES.INVITATION.EXPIRED);
    }

    // Check if the invited email already has an account
    const user = await AuthRepository.findByEmail(invitation.email);
    if (!user) {
      return {
        requiresRegistration: true,
        email: invitation.email,
        boardId: invitation.boardId,
      };
    }

    // If the user is already a member of the board, just mark the invitation as accepted
    const alreadyMember = await InvitationRepository.findBoardMember(invitation.boardId, user.id);
    if (alreadyMember) {
      await InvitationRepository.updateStatus(invitation.id, InvitationStatus.ACCEPTED);
      return {
        boardId: invitation.boardId,
      };
    }

    // Add the user to the board and mark the invitation as accepted
    await InvitationRepository.acceptInvitation(invitation.id, user.id, invitation.boardId);

    return {
      boardId: invitation.boardId,
    };
  },
};
