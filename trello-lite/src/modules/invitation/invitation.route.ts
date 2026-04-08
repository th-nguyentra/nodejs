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

/**
 * @openapi
 * /invitations/accept:
 *   get:
 *     tags: [Invitations]
 *     summary: Accept a board invitation via token
 *     description: >
 *       Verifies the invitation token and handles two flows:
 *       - **Has account**: adds the user to the board as a member and marks the invitation ACCEPTED.
 *       - **No account**: returns `requiresRegistration: true` so the client can redirect to registration.
 *       Invitations expire after the configured number of days (default 7).
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique invitation token from the email link
 *     responses:
 *       200:
 *         description: Invitation accepted or registration required
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Invitation accepted — redirect to board
 *                   required: [boardId]
 *                   properties:
 *                     boardId: { type: string }
 *                 - type: object
 *                   description: No account — redirect to sign-up then board
 *                   required: [requiresRegistration, email, boardId]
 *                   properties:
 *                     requiresRegistration: { type: boolean, example: true }
 *                     email: { type: string }
 *                     boardId: { type: string }
 *               discriminator:
 *                 propertyName: requiresRegistration
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// NOTE: /accept must be registered before any /:id route to prevent Express matching "accept" as an id param
router.get('/invitations/accept', InvitationController.acceptInvitation);

export const InvitationRouter = router;
