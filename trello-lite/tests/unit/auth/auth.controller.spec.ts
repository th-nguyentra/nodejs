import { Request, Response } from 'express';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { HTTP_CODE } from '@/constants';

jest.mock('@/modules/auth/auth.service');

const mockAuthService = jest.mocked(AuthService);

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should return 201 with service result', async () => {
      const req = { body: { email: 'a@a.com', username: 'user', password: 'pass' } } as Request;
      const res = mockRes();
      const serviceResult = { data: { id: '1', email: 'a@a.com' }, access: 'token' };

      mockAuthService.register.mockResolvedValue(serviceResult as never);

      await AuthController.register(req, res);

      expect(AuthService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.CREATED);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
    });
  });

  describe('login', () => {
    it('should return 200 with service result', async () => {
      const req = { body: { email: 'a@a.com', password: 'pass' } } as Request;
      const res = mockRes();
      const serviceResult = { data: { id: '1', email: 'a@a.com' }, access: 'token' };

      mockAuthService.login.mockResolvedValue(serviceResult as never);

      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(HTTP_CODE.OK);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
    });
  });
});
