import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const correlationId = (req.header('X-Correlation-ID') || req.headers['x-correlation-id']) as string | undefined;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      correlationId,
      ip: req.ip,
    });
  });

  next();
};
