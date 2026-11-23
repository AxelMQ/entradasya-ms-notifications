import { config } from '../config/env';
import { getTransporter } from '../config/mailer';
import { logger } from '../utils/logger';
import { OrderConfirmationDTO, WelcomeEmailDTO } from '../schemas/email.schema';
import { renderOrderConfirmationTemplate } from '../templates/order_confirmation';
import { renderWelcomeTemplate } from '../templates/welcome';

export class SmtpDeliveryError extends Error {
  public readonly code: string;
  public readonly originalError?: any;

  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'SmtpDeliveryError';
    this.code = 'NOTIFICATIONS_SMTP_ERROR';
    this.originalError = originalError;
  }
}

export interface EmailSendResult {
  status: 'SENT';
  recipient: string;
  message_id: string;
  messageId: string;
}

export class EmailService {
  async sendOrderConfirmation(data: OrderConfirmationDTO): Promise<EmailSendResult> {
    const rendered = renderOrderConfirmationTemplate(data, config.PUBLIC_GATEWAY_URL);
    const transporter = getTransporter();

    logger.info('Despachando correo de confirmación de compra', {
      order_id: data.order_id,
      recipient: data.customer_email,
      ticket_count: data.tickets.length,
    });

    try {
      const info = await transporter.sendMail({
        from: config.SMTP_FROM,
        to: data.customer_email,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });

      logger.info('Correo de confirmación enviado exitosamente', {
        order_id: data.order_id,
        recipient: data.customer_email,
        messageId: info.messageId,
      });

      return {
        status: 'SENT',
        recipient: data.customer_email,
        message_id: info.messageId,
        messageId: info.messageId,
      };
    } catch (error: any) {
      logger.error('Fallo en el despacho SMTP de confirmación de orden', {
        order_id: data.order_id,
        recipient: data.customer_email,
        error: error?.message || error,
      });

      throw new SmtpDeliveryError(
        `Error al enviar correo por SMTP: ${error?.message || 'Fallo desconocido'}`,
        error
      );
    }
  }

  async sendWelcome(data: WelcomeEmailDTO): Promise<EmailSendResult> {
    const rendered = renderWelcomeTemplate(data, config.PUBLIC_GATEWAY_URL);
    const transporter = getTransporter();

    logger.info('Despachando correo de bienvenida', {
      recipient: data.email,
      name: data.name,
    });

    try {
      const info = await transporter.sendMail({
        from: config.SMTP_FROM,
        to: data.email,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });

      logger.info('Correo de bienvenida enviado exitosamente', {
        recipient: data.email,
        messageId: info.messageId,
      });

      return {
        status: 'SENT',
        recipient: data.email,
        message_id: info.messageId,
        messageId: info.messageId,
      };
    } catch (error: any) {
      logger.error('Fallo en el despacho SMTP de bienvenida', {
        recipient: data.email,
        error: error?.message || error,
      });

      throw new SmtpDeliveryError(
        `Error al enviar correo de bienvenida por SMTP: ${error?.message || 'Fallo desconocido'}`,
        error
      );
    }
  }
}

export const emailService = new EmailService();
