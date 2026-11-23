import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Internal Auth Middleware (X-Internal-Token)', () => {
  const dummyPayload = {
    order_id: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    customer_name: 'Juan Perez',
    customer_email: 'cliente@entradasya.com',
    event_title: 'Concierto de Rock Nacional',
    event_date: '2026-12-15T20:00:00Z',
    venue: 'Teatro al Aire Libre',
    sector_name: 'VIP',
    quantity: 1,
    total_amount: 200.0,
    currency: 'BOB',
    tickets: [
      {
        ticket_code: 'EY-ROCK-8X4N2Q',
        download_url: '/api/v1/tickets/1a2b3c4d/download',
      },
    ],
  };

  it('debe responder 403 Forbidden si la cabecera X-Internal-Token está ausente', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .send(dummyPayload);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'FORBIDDEN',
      message: 'Acceso no autorizado: Token interno ausente',
    });
  });

  it('debe responder 403 Forbidden si la cabecera X-Internal-Token es incorrecta', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email/order-confirmation')
      .set('X-Internal-Token', 'token-invalido-123')
      .send(dummyPayload);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'FORBIDDEN',
      message: 'Acceso no autorizado: Token interno inválido',
    });
  });

  it('debe proteger también la ruta de bienvenida ante token ausente', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email/welcome')
      .send({ name: 'Carlos', email: 'carlos@example.com' });

    expect(response.status).toBe(403);
  });
});
