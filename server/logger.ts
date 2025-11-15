import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const useJsonLogging = isProduction || !process.stdout.isTTY;

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: useJsonLogging ? undefined : {
    target: 'pino-pretty',
    options: { translateTime: 'SYS:standard' },
  },
});


