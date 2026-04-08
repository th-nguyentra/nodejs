import { authenticate, validate } from '@/middlewares';
import { Router } from 'express';
import { InvitationController } from './invitation.controller';
import { createInvitationSchema } from './invitation.dto';

const router = Router();

/**
 * @openapi
 * /invitations:
 *   post:
 *     tags: [Invitations]
 *     summary: Invite a user to a board by email (Admin only)
 *     description: >
 *       Sends an email invitation via SendGrid to the provided address.
 *       A unique token is generated and included in the email.
 *       Duplicate pending invitations for the same email + board are rejected.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, boardId]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newmember@example.com
 *               boardId:
 *                 type: string
 *                 example: clxyz123
 *     responses:
 *       204:
 *         description: Invitation created and email sent
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  '/invitations',
  authenticate,
  validate(createInvitationSchema),
  InvitationController.createInvitation,
);

export const InvitationRouter = router;
