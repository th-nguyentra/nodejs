import { authenticate, validate } from '@/middlewares';
import { Router } from 'express';
import { TaskController } from './task.controller';
import { createTaskSchema, getTasksQuerySchema } from './task.dto';

const router = Router();

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     description: Board members and admins can create tasks. If assigneeId is provided, the assignee must be a member of the board.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [boardId, title]
 *             properties:
 *               boardId:
 *                 type: string
 *                 example: clx123abc
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Implement login page
 *               description:
 *                 type: string
 *                 example: Add email/password login form
 *               assigneeId:
 *                 type: string
 *                 example: clx456def
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-12-31T00:00:00Z'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 title: { type: string }
 *                 description: { type: string, nullable: true }
 *                 status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *                 dueDate: { type: string, format: date-time, nullable: true }
 *                 boardId: { type: string }
 *                 createdAt: { type: string, format: date-time }
 *                 updatedAt: { type: string, format: date-time }
 *                 assignee:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id: { type: string }
 *                     username: { type: string }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/tasks', authenticate, validate(createTaskSchema), TaskController.createTask);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks with filtering and pagination
 *     description: Admin sees all tasks. Member sees only tasks from boards they belong to.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: boardId
 *         schema:
 *           type: string
 *         description: Filter tasks by board ID
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: Filter tasks by assignee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *         description: Filter tasks by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: '2024-01-01T00:00:00Z'
 *         description: Filter tasks with due date from this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: '2024-12-31T23:59:59Z'
 *         description: Filter tasks with due date up to this date (inclusive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, dueDate]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of tasks
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
 *                       title: { type: string }
 *                       description: { type: string, nullable: true }
 *                       status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *                       dueDate: { type: string, format: date-time, nullable: true }
 *                       boardId: { type: string }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *                       assignee:
 *                         type: object
 *                         nullable: true
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
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/tasks', authenticate, validate(getTasksQuerySchema, 'query'), TaskController.getTasks);

export const TaskRouter = router;
