import { Request, Response } from 'express';
import { verifySmtpConnection } from '../config/mailer';

export const healthLiveHandler = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'UP',
    service: 'ms-notifications',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

export const healthReadyHandler = async (_req: Request, res: Response): Promise<void> => {
  const isSmtpReady = await verifySmtpConnection();

  if (isSmtpReady) {
    res.status(200).json({
      status: 'UP',
      smtp: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(503).json({
    status: 'DOWN',
    smtp: 'DISCONNECTED',
    message: 'Servidor SMTP no disponible o fuera de línea',
    timestamp: new Date().toISOString(),
  });
};
