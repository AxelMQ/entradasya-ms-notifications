import express, { Application } from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { internalAuthMiddleware } from './middleware/internal_auth.middleware';
import { healthLiveHandler, healthReadyHandler } from './controllers/health.controller';
import {
  sendOrderConfirmationHandler,
  sendWelcomeEmailHandler,
} from './controllers/notification.controller';

export const createApp = (): Application => {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(loggerMiddleware);

  // Health Checks (Públicos / Monitoreo)
  app.get('/health/live', healthLiveHandler);
  app.get('/health/ready', healthReadyHandler);
  app.get('/health', healthLiveHandler);

  // Rutas de Notificaciones (Protegidas con X-Internal-Token)
  const notificationsRouter = express.Router();
  notificationsRouter.use(internalAuthMiddleware);

  notificationsRouter.post('/email/order-confirmation', sendOrderConfirmationHandler);
  notificationsRouter.post('/email/welcome', sendWelcomeEmailHandler);

  app.use('/api/v1/notifications', notificationsRouter);

  // Alias para retrocompatibilidad interna
  app.post('/send-confirmation', internalAuthMiddleware, sendOrderConfirmationHandler);

  // Manejo de errores global
  app.use(errorHandler);

  return app;
};

export const app = createApp();
