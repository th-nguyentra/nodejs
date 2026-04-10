import { Request, Response } from 'express';
import { InvitationController } from '@/modules/invitation/invitation.controller';
import { InvitationService } from '@/modules/invitation/invitation.service';
import { HTTP_CODE, MESSAGES } from '@/constants';
import { ApiError } from '@/utils';
import { Role } from 'generated/prisma/client';

jest.mock('@/modules/invitation/invitation.service');
jest.mock('@/configs', () => ({
  env: { sendgrid: { apiKey: '', from: '' }, invitation: { expiresInDays: 7 } },
  logger: { error: jest.fn(), info: jest.fn() },
}));

const mockInvitationService = jest.mocked(InvitationService);

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const adminUser = { id: 'admin-id', role: Role.ADMIN };

describe('InvitationController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createInvitation', () => {
    it('should return 204 after creating invitation', async () => {
      const req = {
        body: { email: 'invite@test.com', boardId: 'board-id' },
        user: adminUser,
      } as unknown as Request;
      const res = mockRes();
      mockInvitationService.createInvitation.mockResolvedValue(undefined);

      await InvitationController.createInvitation(req, res);

      expect(InvitationService.createInvitation).toHaveBeenCalledWith(
        { email: 'invite@test.com', boardId: 'board-id' },
        adminUser,
      );
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('acceptInvitation', () => {
    it('should return 200 with service result when token is provided', async () => {
      const req = { query: { token: 'valid-token' } } as unknown as Request;
      const res = mockRes();
      const serviceResult = { boardId: 'board-id' };
      mockInvitationService.acceptInvitation.mockResolvedValue(serviceResult);

      await InvitationController.acceptInvitation(req, res);

      expect(InvitationService.acceptInvitation).toHaveBeenCalledWith('valid-token');
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
    });

    it('should throw badRequest when token is missing', async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();

      await expect(InvitationController.acceptInvitation(req, res)).rejects.toThrow(
        ApiError.badRequest(MESSAGES.INVITATION.TOKEN_REQUIRED),
      );
    });
  });
});
