import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './env';
import { logger } from '../utils/logger';

let transporterInstance: Transporter | null = null;

export const createMailerTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false, // Mailpit en puerto 1025 no requiere TLS directo
    auth: config.SMTP_USER
      ? {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        }
      : undefined,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
};

export const getTransporter = (): Transporter => {
  if (!transporterInstance) {
    transporterInstance = createMailerTransporter();
  }
  return transporterInstance;
};

export const setTransporter = (transporter: Transporter): void => {
  transporterInstance = transporter;
};

export const verifySmtpConnection = async (): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    logger.info('Conexión con servidor SMTP establecida con éxito');
    return true;
  } catch (error: any) {
    logger.warn('No se pudo verificar la conexión con el servidor SMTP', {
      error: error?.message || error,
    });
    return false;
  }
};
