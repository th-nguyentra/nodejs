import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import { errorHandler, requestLogger } from '@/middlewares';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Format JSON response
app.set('json spaces', 2);

// Logging
app.use(requestLogger);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
