import { HTTP_CODE, MESSAGES } from '@/constants';
import { Request, Response } from 'express';
import { createInvitationSchema } from './invitation.dto';
import { InvitationService } from './invitation.service';
import { ApiError } from '@/utils';

export const InvitationController = {
  createInvitation: async (req: Request, res: Response) => {
    const data = createInvitationSchema.parse(req.body);

    await InvitationService.createInvitation(data, req.user!);

    res.status(HTTP_CODE.NO_CONTENT).send();
  },

  acceptInvitation: async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) throw ApiError.badRequest(MESSAGES.INVITATION.TOKEN_REQUIRED);

    const result = await InvitationService.acceptInvitation(token);

    res.status(HTTP_CODE.OK).json(result);
  },
};
