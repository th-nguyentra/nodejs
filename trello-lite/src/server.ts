import app from './app';
import { env, logger, prisma } from '@/configs';

prisma
  .$connect()
  .then(() => {
    app.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port}`);
    });
  })
  .catch((err) => {
    logger.error('Unable to connect to the DB:', err);
    process.exit(1);
  });
