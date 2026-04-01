import { logger, env } from '@/configs';
import app from './app';

app.listen(env.port, () => {
  logger.info(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
});
