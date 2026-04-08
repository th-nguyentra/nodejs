import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import { passport, swaggerSpec } from '@/configs';
import { errorHandler, requestLogger } from '@/middlewares';
import { AuthRouter } from './modules/auth/auth.route';
import { BoardRouter } from './modules/board/board.route';
import { InvitationRouter } from './modules/invitation/invitation.route';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Format JSON response
app.set('json spaces', 2);

// Logging
app.use(requestLogger);

// Passport
app.use(passport.initialize());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1', AuthRouter);
app.use('/api/v1', BoardRouter);
app.use('/api/v1', InvitationRouter);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
