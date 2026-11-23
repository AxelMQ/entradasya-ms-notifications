import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setTransporter } from '../src/config/mailer';

describe('POST /api/v1/notifications/email/welcome', () => {
  const validToken = 'internal-service-secret-entradasya-2026';

  let mockSendMail: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockSendMail = vi.fn().mockResolvedValue({
      messageId: '<welcome-12345@entradasya.local>',
    });

    const mockTransporter: any = {
      sendMail: mockSendMail,
      verify: vi.fn().mockResolvedValue(true),
    };

    setTransporter(mockTransporter);
  });

  it('debe enviar el correo de bienvenida exitosamente y responder 200 OK', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email/welcome')
      .set('X-Internal-Token', validToken)
      .send({
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'SENT',
        recipient: 'carlos@example.com',
        message_id: '<welcome-12345@entradasya.local>',
      })
    );

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.to).toBe('carlos@example.com');
    expect(mailArgs.html).toContain('Carlos Gomez');
  });

  it('debe responder 400 Bad Request si el email no es válido', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email/welcome')
      .set('X-Internal-Token', validToken)
      .send({
        name: 'Carlos Gomez',
        email: 'email-invalido',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('debe responder 503 si el transporte SMTP falla al enviar bienvenida', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP connection error'));

    const response = await request(app)
      .post('/api/v1/notifications/email/welcome')
      .set('X-Internal-Token', validToken)
      .send({
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
      });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe('NOTIFICATIONS_SMTP_ERROR');
  });
});
