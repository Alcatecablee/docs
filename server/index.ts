import { createServer } from "http";
import { setupVite } from "./vite";
import { logger } from './logger';
import cron from 'node-cron';
import { runDailyCleanup } from './data-retention';
import app from './app';

const port = process.env.PORT || 5000;
const server = createServer(app);

async function start() {
  await setupVite(app, server);

  // Setup data retention cron job (runs daily at 2 AM UTC)
  // See: COMPLIANCE.md for retention policies
  if (process.env.ENABLE_DATA_RETENTION !== 'false') {
    cron.schedule('0 2 * * *', async () => {
      try {
        await runDailyCleanup();
      } catch (error) {
        logger.error({ error }, 'Data retention cleanup job failed');
      }
    }, {
      timezone: 'UTC'
    });
    logger.info('Data retention cron job scheduled (daily at 2 AM UTC)');
  } else {
    logger.warn('Data retention automation disabled via ENABLE_DATA_RETENTION=false');
  }

  server.listen(Number(port), "0.0.0.0", () => {
    logger.info({ port }, 'Server running');
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

export default app;
