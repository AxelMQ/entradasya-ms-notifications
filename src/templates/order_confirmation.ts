import { OrderConfirmationDTO } from '../schemas/email.schema';

export interface RenderedEmail {
  html: string;
  text: string;
  subject: string;
}

export const renderOrderConfirmationTemplate = (
  data: OrderConfirmationDTO,
  baseUrl: string
): RenderedEmail => {
  const subject = `¡Tus entradas están listas! - Orden #${data.order_id.slice(0, 8)}`;

  // Formateo de fecha legible
  let formattedDate = data.event_date;
  try {
    const d = new Date(data.event_date);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleString('es-BO', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
    }
  } catch {
    formattedDate = data.event_date;
  }

  // Resolver URLs absolutas de descarga
  const ticketsWithFullUrls = data.tickets.map((t) => {
    let fullUrl = t.download_url;
    if (fullUrl.startsWith('/')) {
      const cleanBase = baseUrl.replace(/\/+$/, '');
      fullUrl = `${cleanBase}${fullUrl}`;
    }
    return {
      ticket_code: t.ticket_code,
      download_url: fullUrl,
    };
  });

  const formattedAmount = `${data.currency} ${data.total_amount.toFixed(2)}`;

  // Generación de botones HTML
  const ticketButtonsHtml = ticketsWithFullUrls
    .map(
      (t) => `
      <div style="margin: 14px 0; text-align: center;">
        <a href="${t.download_url}"
           target="_blank"
           style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
          🎟️ Descargar Entrada: <strong>${t.ticket_code}</strong>
        </a>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          Código: ${t.ticket_code}
        </div>
      </div>`
    )
    .join('');

  // Plantilla HTML responsiva
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      letter-spacing: 1px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 28px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .summary-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .summary-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .summary-label {
      color: #64748b;
      font-weight: 500;
    }
    .summary-value {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .total-row {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      font-size: 16px;
      font-weight: bold;
      color: #059669;
    }
    .notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 14px 16px;
      border-radius: 4px;
      margin: 24px 0;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🎟️ EntradasYa</h1>
        <p>Confirmación de Compra Exitosa</p>
      </div>
      <div class="content">
        <div class="greeting">¡Hola, ${data.customer_name}!</div>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Tu compra ha sido procesada exitosamente. A continuación te presentamos el resumen de tu orden y los enlaces directos para descargar tus boletos.
        </p>

        <div class="summary-card">
          <div class="summary-title">Resumen del Evento</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Evento:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">${data.event_title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Fecha y Hora:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Lugar:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">${data.venue}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Sector y Cantidad:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">${data.sector_name} &times; ${data.quantity}</td>
            </tr>
            <tr style="border-top: 1px dashed #cbd5e1;">
              <td style="padding: 10px 0 4px 0; color: #0f172a; font-size: 16px;"><strong>Total Pagado:</strong></td>
              <td style="padding: 10px 0 4px 0; text-align: right; color: #059669; font-size: 17px; font-weight: bold;">${formattedAmount}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 25px 0 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px;">Tus Entradas Disponibles:</h3>
          ${ticketButtonsHtml}
        </div>

        <div class="notice">
          <strong>Aviso Importante:</strong><br/>
          Presenta el código QR de este boleto al ingresar al evento. Cada boleto es válido para un solo acceso.
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px 0;">EntradasYa &copy; 2026 - Todos los derechos reservados.</p>
        <p style="margin: 0;">¿Tienes dudas? Visita nuestro portal de soporte o contáctanos.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Versión en texto plano
  const textTickets = ticketsWithFullUrls
    .map(
      (t, index) =>
        `  ${index + 1}. Código: ${t.ticket_code}\n     Descarga: ${t.download_url}`
    )
    .join('\n\n');

  const text = `¡Hola, ${data.customer_name}!

Gracias por tu compra en EntradasYa. Tu orden #${data.order_id} ha sido confirmada con éxito.

========================================
RESUMEN DEL EVENTO
========================================
Evento: ${data.event_title}
Fecha y Hora: ${formattedDate}
Lugar: ${data.venue}
Sector y Cantidad: ${data.sector_name} x ${data.quantity}
Total Pagado: ${formattedAmount}
Orden ID: ${data.order_id}

========================================
DESCARGA DE TUS BOLETOS
========================================
${textTickets}

========================================
AVISO IMPORTANTE
========================================
Presenta el código QR de este boleto al ingresar al evento. Cada boleto es válido para un solo acceso.

--
EntradasYa 2026 - Plataforma de Venta y Gestión de Entradas
`;

  return { html, text, subject };
};
