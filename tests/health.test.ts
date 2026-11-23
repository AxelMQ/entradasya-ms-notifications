import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import * as mailer from '../src/config/mailer';

describe('Health Checks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health/live', () => {
    it('debe responder 200 OK con status UP', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
      expect(response.body).toHaveProperty('service', 'ms-notifications');
    });

    it('debe responder 200 OK en el alias /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
    });
  });

  describe('GET /health/ready', () => {
    it('debe responder 200 OK si la conexión SMTP es exitosa', async () => {
      vi.spyOn(mailer, 'verifySmtpConnection').mockResolvedValue(true);

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'UP',
          smtp: 'CONNECTED',
        })
      );
    });

    it('debe responder 503 Service Unavailable si el servidor SMTP no responde', async () => {
      vi.spyOn(mailer, 'verifySmtpConnection').mockResolvedValue(false);

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'DOWN',
          smtp: 'DISCONNECTED',
        })
      );
    });
  });
});
