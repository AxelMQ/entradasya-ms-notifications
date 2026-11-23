import { Request, Response } from 'express';
import { orderConfirmationSchema, welcomeEmailSchema } from '../schemas/email.schema';
import { emailService, SmtpDeliveryError } from '../services/email.service';
import { logger } from '../utils/logger';

export const sendOrderConfirmationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const correlationId = req.header('X-Correlation-ID');
  const parseResult = orderConfirmationSchema.safeParse(req.body);

  if (!parseResult.success) {
    logger.warn('Validación fallida en order-confirmation', {
      correlationId,
      errors: parseResult.error.errors,
    });

    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Cuerpo de la petición incompleto o inválido',
      errors: parseResult.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  try {
    const result = await emailService.sendOrderConfirmation(parseResult.data);
    res.status(200).json({
      status: result.status,
      recipient: result.recipient,
      message_id: result.message_id,
      messageId: result.messageId,
    });
  } catch (error: any) {
    if (error instanceof SmtpDeliveryError) {
      res.status(503).json({
        code: error.code,
        message: 'Servidor SMTP no disponible o falló la entrega del correo',
        detail: error.message,
      });
      return;
    }

    logger.error('Error no controlado al procesar confirmación de orden', {
      error: error?.message || error,
      correlationId,
    });

    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor al procesar la notificación',
    });
  }
};

export const sendWelcomeEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parseResult = welcomeEmailSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Cuerpo de la petición incompleto o inválido',
      errors: parseResult.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  try {
    const result = await emailService.sendWelcome(parseResult.data);
    res.status(200).json({
      status: result.status,
      recipient: result.recipient,
      message_id: result.message_id,
      messageId: result.messageId,
    });
  } catch (error: any) {
    if (error instanceof SmtpDeliveryError) {
      res.status(503).json({
        code: error.code,
        message: 'Servidor SMTP no disponible para el envío de bienvenida',
        detail: error.message,
      });
      return;
    }

    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor al enviar correo de bienvenida',
    });
  }
};
