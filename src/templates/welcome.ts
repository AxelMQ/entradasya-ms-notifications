import { WelcomeEmailDTO } from '../schemas/email.schema';

export interface RenderedWelcomeEmail {
  html: string;
  text: string;
  subject: string;
}

export const renderWelcomeTemplate = (
  data: WelcomeEmailDTO,
  portalUrl: string
): RenderedWelcomeEmail => {
  const subject = '¡Bienvenido a EntradasYa! Tu cuenta está lista';

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
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
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
    .button-container {
      text-align: center;
      margin: 25px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      font-weight: 600;
      font-size: 15px;
      border-radius: 6px;
    }
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🎟️ EntradasYa</h1>
        <p>¡Tu puerta de entrada a los mejores eventos!</p>
      </div>
      <div class="content">
        <div class="greeting">¡Hola, ${data.name}!</div>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Te damos una cordial bienvenida a <strong>EntradasYa</strong>. Tu cuenta asociada al correo <code>${data.email}</code> ha sido creada exitosamente.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          A partir de ahora podrás explorar los eventos más esperados, adquirir tus entradas de manera segura y gestionar tus boletos con códigos QR desde cualquier dispositivo.
        </p>

        <div class="button-container">
          <a href="${portalUrl}" class="btn">Explorar Cartelera de Eventos</a>
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px 0;">EntradasYa &copy; 2026 - Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `¡Hola, ${data.name}!

¡Te damos una cordial bienvenida a EntradasYa!
Tu cuenta con el correo ${data.email} ha sido creada exitosamente.

Ya puedes acceder a nuestra plataforma para explorar y comprar entradas para los mejores conciertos, partidos y espectáculos.

Visítanos en: ${portalUrl}

--
EntradasYa 2026
`;

  return { html, text, subject };
};
