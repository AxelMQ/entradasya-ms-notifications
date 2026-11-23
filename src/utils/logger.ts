import winston from 'winston';
import { config } from '../config/env';

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}]: ${message}${metaString}`;
});

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.NODE_ENV === 'production' ? json() : combine(colorize(), consoleFormat)
  ),
  defaultMeta: { service: 'ms-notifications' },
  transports: [
    new winston.transports.Console()
  ],
});
