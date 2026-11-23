import { app } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { verifySmtpConnection } from './config/mailer';

const server = app.listen(config.PORT, () => {
  logger.info(`[ms-notifications] Servidor ejecutándose en http://localhost:${config.PORT}`, {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    smtpHost: config.SMTP_HOST,
    smtpPort: config.SMTP_PORT,
  });

  // Verificación no bloqueante del servidor SMTP al iniciar
  verifySmtpConnection().then((isReady) => {
    if (isReady) {
      logger.info('[ms-notifications] Servidor SMTP (Mailpit) conectado y listo');
    } else {
      logger.warn(
        '[ms-notifications] Servidor SMTP no disponible al inicio. Los correos se reintentarán según el orquestador.'
      );
    }
  });
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Señal ${signal} recibida. Cerrando ms-notifications de forma ordenada...`);
  server.close(() => {
    logger.info('Servidor HTTP cerrado.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default server;
