import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Excepción no capturada en Express', {
    error: err?.message || err,
    stack: err?.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocurrió un error inesperado en el servidor',
  });
};
