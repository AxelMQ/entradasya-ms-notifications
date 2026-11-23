import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setTransporter, createMailerTransporter } from '../src/config/mailer';
import { renderOrderConfirmationTemplate } from '../src/templates/order_confirmation';

describe('POST /api/v1/notifications/email/order-confirmation', () => {
  const validToken = 'internal-service-secret-entradasya-2026';

  const validPayload = {
    order_id: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    customer_name: 'Juan Perez',
    customer_email: 'cliente@entradasya.com',
    event_title: 'Concierto de Rock Nacional',
    event_date: '2026-12-15T20:00:00Z',
    venue: 'Teatro al Aire Libre',
    sector_name: 'VIP',
    quantity: 2,
    total_amount: 400.0,
    currency: 'BOB',
    tickets: [
      {
        ticket_code: 'EY-ROCK-8X4N2Q',
        download_url: '/api/v1/tickets/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d/download',
      },
      {
        ticket_code: 'EY-ROCK-3M9K1L',
        download_url: '/api/v1/tickets/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e/download',
      },
    ],
  };

  let mockSendMail: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockSendMail = vi.fn().mockResolvedValue({
      messageId: '<c2f1-test-id@entradasya.local>',
    });

    const mockTransporter: any = {
      sendMail: mockSendMail,
      verify: vi.fn().mockResolvedValue(true),
    };

    setTransporter(mockTransporter);
  });

  it('debe enviar el correo de confirmación exitosamente y retornar 200 OK con message_id', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', validToken)
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'SENT',
        recipient: 'cliente@entradasya.com',
        message_id: '<c2f1-test-id@entradasya.local>',
      })
    );

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailArgs = mockSendMail.mock.calls[0][0];

    expect(mailArgs.to).toBe('cliente@entradasya.com');
    expect(mailArgs.html).toContain('Juan Perez');
    expect(mailArgs.html).toContain('Concierto de Rock Nacional');
    expect(mailArgs.html).toContain('Teatro al Aire Libre');
    expect(mailArgs.html).toContain('VIP');
    expect(mailArgs.html).toContain('400.00');
    expect(mailArgs.html).toContain('EY-ROCK-8X4N2Q');
    expect(mailArgs.html).toContain('EY-ROCK-3M9K1L');
    expect(mailArgs.html).toContain(
      'Presenta el código QR de este boleto al ingresar al evento. Cada boleto es válido para un solo acceso.'
    );

    expect(mailArgs.text).toContain('Juan Perez');
    expect(mailArgs.text).toContain('BOB 400.00');
    expect(mailArgs.text).toContain('EY-ROCK-8X4N2Q');
    expect(mailArgs.text).toContain('Presenta el código QR');
  });

  it('debe rechazar con 400 Bad Request si el email es inválido', async () => {
    const payload = { ...validPayload, customer_email: 'correo-no-valido' };

    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', validToken)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('debe rechazar con 400 Bad Request si order_id no es un UUID válido', async () => {
    const payload = { ...validPayload, order_id: '12345' };

    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', validToken)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('debe rechazar con 400 Bad Request si la cantidad es menor o igual a 0', async () => {
    const payload = { ...validPayload, quantity: 0 };

    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', validToken)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe rechazar con 400 Bad Request si no se proveen tickets', async () => {
    const payload = { ...validPayload, tickets: [] };

    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', validToken)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe capturar el fallo de SMTP sin tumbar el servidor y responder 503 Service Unavailable', async () => {
    mockSendMail.mockRejectedValue(new Error('Connection refused: connect ECONNREFUSED 127.0.0.1:1025'));

    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', validToken)
      .send(validPayload);

    expect(response.status).toBe(503);
    expect(response.body.code).toBe('NOTIFICATIONS_SMTP_ERROR');
    expect(response.body.message).toContain('Servidor SMTP no disponible');
  });
});
