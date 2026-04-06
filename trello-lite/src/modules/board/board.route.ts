import { authenticate, validate } from '@/middlewares';
import { Router } from 'express';
import { BoardController } from './board.controller';
import { getBoardsQuerySchema } from './board.dto';

const router = Router();

/**
 * @openapi
 * /boards:
 *   get:
 *     tags: [Boards]
 *     summary: Get boards (role-based)
 *     description: Admin sees all boards. Member sees only boards they belong to.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter boards by name (case-insensitive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated list of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *                       description: { type: string, nullable: true }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *                       creator:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           username: { type: string }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/boards',
  authenticate,
  validate(getBoardsQuerySchema, 'query'),
  BoardController.getBoards,
);

export const BoardRouter = router;
