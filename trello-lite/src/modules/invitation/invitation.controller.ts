import { HTTP_CODE } from '@/constants';
import { Request, Response } from 'express';
import { createInvitationSchema } from './invitation.dto';
import { InvitationService } from './invitation.service';

export const InvitationController = {
  createInvitation: async (req: Request, res: Response) => {
    const data = createInvitationSchema.parse(req.body);

    await InvitationService.createInvitation(data, req.user!);

    res.status(HTTP_CODE.NO_CONTENT).send();
  },
};
