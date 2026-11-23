import { z } from 'zod';

export const ticketItemSchema = z.object({
  ticket_code: z.string().min(1, 'ticket_code es requerido'),
  download_url: z.string().min(1, 'download_url es requerido'),
});

export const orderConfirmationSchema = z.object({
  order_id: z.string().uuid('order_id debe ser un UUID válido'),
  customer_name: z.string().min(1, 'customer_name es requerido'),
  customer_email: z.string().email('customer_email debe ser un correo electrónico válido'),
  event_title: z.string().min(1, 'event_title es requerido'),
  event_date: z.string().min(1, 'event_date es requerido'),
  venue: z.string().min(1, 'venue es requerido'),
  sector_name: z.string().min(1, 'sector_name es requerido'),
  quantity: z.number().int().positive('quantity debe ser un número entero mayor a 0'),
  total_amount: z.number().nonnegative('total_amount debe ser un número no negativo'),
  currency: z.string().default('BOB'),
  tickets: z.array(ticketItemSchema).min(1, 'Debe incluir al menos un ticket'),
});

export type OrderConfirmationDTO = z.infer<typeof orderConfirmationSchema>;
export type TicketItemDTO = z.infer<typeof ticketItemSchema>;

export const welcomeEmailSchema = z.object({
  name: z.string().min(1, 'name es requerido'),
  email: z.string().email('email debe ser un correo electrónico válido'),
});

export type WelcomeEmailDTO = z.infer<typeof welcomeEmailSchema>;
