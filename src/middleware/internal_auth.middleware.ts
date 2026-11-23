import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export const internalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header('X-Internal-Token');

  if (!token) {
    logger.warn('Petición rechazada: Falta cabecera X-Internal-Token', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Acceso no autorizado: Token interno ausente',
    });
    return;
  }

  if (token !== config.INTERNAL_TOKEN) {
    logger.warn('Petición rechazada: Cabecera X-Internal-Token inválida', {
      path: req.path,
      method: req.method,
    });
    res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Acceso no autorizado: Token interno inválido',
    });
    return;
  }

  next();
};
