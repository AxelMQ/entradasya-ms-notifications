import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8006),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  INTERNAL_TOKEN: z.string().default('internal-service-secret-entradasya-2026'),
  INTERNAL_SERVICE_KEY: z.string().optional(),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('EntradasYa <no-reply@entradasya.com>'),
  PUBLIC_GATEWAY_URL: z.string().default('http://localhost'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error de validación en las variables de entorno:', parsedEnv.error.format());
  throw new Error('Configuración inválida en las variables de entorno de ms-notifications');
}

export const config = {
  ...parsedEnv.data,
  // Permite interoperabilidad si se usa INTERNAL_TOKEN o INTERNAL_SERVICE_KEY
  INTERNAL_TOKEN: parsedEnv.data.INTERNAL_TOKEN || parsedEnv.data.INTERNAL_SERVICE_KEY || 'internal-service-secret-entradasya-2026',
};

export type Config = typeof config;
