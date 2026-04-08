import { env, logger } from '@/configs';
import { MESSAGES } from '@/constants';
import { ApiError } from '@/utils';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { Role } from '../../../generated/prisma/client';
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

    // Prevent duplicate pending invitations
    const existing = await InvitationRepository.findPendingInvitation(data.email, data.boardId);
    if (existing) throw ApiError.conflict(MESSAGES.INVITATION.ALREADY_PENDING);

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
};
