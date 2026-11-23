# ms-notifications - Microservicio de Notificaciones de EntradasYa

Microservicio interno stateless encargado de la generación y despacho de correos electrónicos transaccionales para la plataforma **EntradasYa**, integrando plantillas HTML responsivas y entrega SMTP hacia **Mailpit**.

* **Tecnología:** Node.js 20 LTS, TypeScript, Express, Nodemailer, Zod, Winston
* **Puerto:** `8006` (Servicio interno, no expuesto en Nginx)
* **Persistencia:** Ninguna (Stateless, trazabilidad mediante logs estructurados)
* **Servidor SMTP:** Mailpit (`localhost:1025` SMTP / `localhost:8025` Web UI)

---

## 1. Variables de Entorno

Configurar el archivo `.env` tomando como base `.env.example`:

```env
PORT=8006
NODE_ENV=development
INTERNAL_TOKEN=internal-service-secret-entradasya-2026
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM="EntradasYa <no-reply@entradasya.com>"
PUBLIC_GATEWAY_URL=http://localhost
LOG_LEVEL=info
```

---

## 2. Endpoints y Autenticación

Todas las rutas bajo `/api/v1/notifications/*` son internas y exigen obligatoriamente la cabecera:
```http
X-Internal-Token: internal-service-secret-entradasya-2026
```

### 2.1 Confirmación de Compra (Contrato 4)
* **Método y Ruta:** `POST /api/v1/notifications/email/order-confirmation`
* **Cabecera:** `X-Internal-Token: <token>`
* **Payload:**
```json
{
  "order_id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "customer_name": "Juan Perez",
  "customer_email": "cliente@entradasya.com",
  "event_title": "Concierto de Rock Nacional",
  "event_date": "2026-12-15T20:00:00Z",
  "venue": "Teatro al Aire Libre",
  "sector_name": "VIP",
  "quantity": 2,
  "total_amount": 400.00,
  "currency": "BOB",
  "tickets": [
    {
      "ticket_code": "EY-ROCK-8X4N2Q",
      "download_url": "/api/v1/tickets/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d/download"
    }
  ]
}
```
* **Respuestas:**
  - `200 OK`: `{"status": "SENT", "recipient": "...", "message_id": "<...>"}`
  - `400 Bad Request`: Payload incompleto o email inválido.
  - `403 Forbidden`: Token ausente o incorrecto.
  - `503 Service Unavailable`: Servidor SMTP fuera de línea (capturado de forma no bloqueante).

### 2.2 Correo de Bienvenida
* **Método y Ruta:** `POST /api/v1/notifications/email/welcome`
* **Cabecera:** `X-Internal-Token: <token>`
* **Payload:** `{"name": "Carlos Gomez", "email": "carlos@example.com"}`

### 2.3 Health Checks
* `GET /health/live`: `200 OK` si el proceso está activo.
* `GET /health/ready`: `200 OK` si la conexión SMTP (`transporter.verify()`) está activa; `503 Service Unavailable` si SMTP no responde.

---

## 3. Comandos de Desarrollo y Pruebas

```bash
# Instalar dependencias
npm install

# Ejecutar suite de pruebas unitarias automatizadas
npm test

# Compilar proyecto TypeScript a /dist
npm run build

# Ejecutar servidor de desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## Estado de Verificacion CI/CD

- Pipeline `.github/workflows/ci-develop.yml` verificado con disparo automatico en rama `develop`, generando artifacts descargables e imagenes en GHCR y Docker Hub.
