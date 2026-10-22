# Circuito · Tienda online (Laboratorio #2)

Tienda online con inventario, cupones, cálculo de envío, cancelación de órdenes, inicio de sesión,
métricas analíticas y un asistente de IA en n8n.

| Capa | Tecnología |
| --- | --- |
| Base de datos | SQLite 3.53 (`better-sqlite3`) · `backend/db/schema.sql` |
| API | Node.js 22+ · Express 5 · arquitectura por capas (routes → controllers → services → repositories) |
| Autenticación | Sesiones en BD + cookie `httpOnly` · contraseñas con `scrypt` |
| Frontend | React 19 · Vite · React Router · Tailwind CSS 4 · animaciones con CSS |
| IA | n8n: Webhook → AI Agent → Respond to Webhook con contrato `{ ok, data, error }` |

## Puesta en marcha

```bash
git clone https://github.com/AngelDST13/Lab2-Backend.git
cd Lab2-Backend

# 1. API (la base SQLite se crea sola en el primer arranque)
cd backend
cp .env.example .env        # completar N8N_WEBHOOK_SECRET y AGENT_SERVICE_TOKEN
npm install
npm test                    # cálculo de precios + contraseñas
npm run dev                 # http://localhost:3000

# 2. n8n (otra terminal, desde la raíz del repositorio)
n8n import:workflow --input=n8n/asistente-tienda.workflow.json
n8n publish:workflow --id=lab2AsistenteTienda
n8n start                   # http://localhost:5678

# 3. Frontend (otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

- **Primer arranque**: `src/db.js` detecta que la base no tiene tablas y ejecuta `db/schema.sql` (tablas, índices,
  triggers y datos de prueba). Nunca borra una base existente.
- **Reiniciar los datos** (antes de una demo): `npm run db:init`.

### Usuarios de prueba

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administración | `admin@circuito.cr` | `Admin#2026` |
| Cliente | `ana@example.com` | `Cliente#2026` |
| Cliente | `carlos@example.com` | `Cliente#2026` |
| Cliente | `lucia@example.com` | `Cliente#2026` |

Solo existen en la base local de desarrollo; `schema.sql` guarda únicamente sus hashes.

## Estructura

```text
backend/
├── db/
│   ├── schema.sql            9 tablas STRICT, FKs, CHECKs, índice parcial, triggers y datos de prueba
│   └── init.js               npm run db:init → reinicia la base
├── src/
│   ├── server.js             arranque del servidor
│   ├── app.js                middlewares globales y montaje de rutas
│   ├── db.js                 conexión SQLite, inicialización automática, withTransaction
│   ├── config/env.js         variables de entorno validadas
│   ├── routes/               URL + validación + permisos       (*.routes.js)
│   ├── controllers/          HTTP ↔ service, sin lógica        (*.controller.js)
│   ├── services/             reglas de negocio y transacciones (*.service.js, pricing.js)
│   ├── repositories/         SQL parametrizado                 (*.repository.js)
│   ├── schemas/              validación de entrada con zod     (*.schema.js)
│   ├── middlewares/          auth, validate, errorHandler, rateLimit, notFound
│   └── utils/                AppError, money, password, cookies, response
└── tests/                    node --test
frontend/src/
├── app/                      rutas, layout, navegación
├── features/                 auth, products, cart, orders, summary, assistant
├── shared/                   componentes UI, Logo, useFetch, useAsyncAction
└── services/apiClient.js     único punto que llama a fetch
n8n/asistente-tienda.workflow.json
```

## Formato de respuestas

| | API REST (`/api/...`) | Webhook de n8n |
| --- | --- | --- |
| Éxito | el recurso tal cual: `{ "id": 1, ... }` o `[ ... ]` | `{ "ok": true, "data": { "reply": "..." }, "error": null }` |
| Error | `{ "error": "mensaje" }` (+ `"details"` por campo o producto) | `{ "ok": false, "data": null, "error": { "code", "message" } }` |

Códigos de estado: `200` consulta/actualización · `201` creación · `400` datos inválidos · `401` sin sesión ·
`403` sin permiso · `404` no existe · `409` conflicto con el estado actual (stock, duplicado, transición) · `429` demasiados intentos.

## Endpoints

| Método | Ruta | Acceso | Éxito | Errores |
| --- | --- | --- | --- | --- |
| GET | `/health` | público | 200 | 503 |
| POST | `/api/auth/login` | público | 200 | 400, 401, 429 |
| POST | `/api/auth/register` | público | 201 | 400, 409, 429 |
| POST | `/api/auth/logout` | público | 200 | — |
| GET | `/api/auth/me` | público | 200 | — |
| GET | `/api/products?search=&active=` | público | 200 | 400 |
| GET | `/api/products/:id` | público | 200 | 400, 404 |
| POST | `/api/products` | admin | 201 | 400, 409 |
| PATCH | `/api/products/:id` | admin | 200 | 400, 404, 409 |
| DELETE | `/api/products/:id` | admin | 200 | 404, 409 (tiene ventas) |
| POST | `/api/products/:id/restock` | admin | 200 | 400, 404 |
| GET | `/api/products/:id/movements` | admin | 200 | 404 |
| GET | `/api/customers` | admin | 200 | — |
| GET | `/api/customers/:id` | admin | 200 | 400, 404 |
| GET | `/api/customers/:id/orders?status=` | admin | 200 | 400, 404 |
| POST | `/api/customers` | admin | 201 | 400, 409 |
| PATCH | `/api/customers/:id` | admin | 200 | 400, 404, 409 |
| DELETE | `/api/customers/:id` | admin | 200 | 404, 409 (tiene órdenes) |
| GET | `/api/shipping-zones` | público | 200 | — |
| GET | `/api/coupons/:code/validate?subtotal=` | público | 200 | 400, 404, 409 |
| GET | `/api/orders?status=&customerId=` | sesión | 200 | 400 |
| GET | `/api/orders/:id` | sesión | 200 | 400, 404 |
| POST | `/api/orders/quote` | sesión | 200 | 400, 404, 409 |
| POST | `/api/orders` | sesión | 201 | 400, 404, 409 |
| POST | `/api/orders/:id/cancel` | sesión | 200 | 400, 404, 409 |
| PATCH | `/api/orders/:id/status` | admin | 200 | 400, 404, 409 |
| GET | `/api/resumen?dias=14` | admin | 200 | 400 |
| POST | `/api/agent/chat` | sesión | 200 | 400, 429, 502, 503, 504 |

Rutas de "sesión" y "admin" responden `401` sin sesión y `403` sin el rol.

## Base de datos (SQLite)

```text
customers ──< orders >── shipping_zones          users ──< sessions
              │  └──── coupons (opcional)          │
              ├──< order_items >── products        └── customers (1:1, solo rol CUSTOMER)
              └──< stock_movements >── products
```

| Decisión | Por qué |
| --- | --- |
| `PRAGMA foreign_keys = ON` en cada conexión | En SQLite vienen apagadas por defecto |
| Dinero en céntimos (`INTEGER`) y peso en gramos | SQLite no tiene decimal exacto; `REAL` acumula errores de redondeo |
| Tablas `STRICT` | Rechaza `'caro'` en una columna `INTEGER` (por defecto SQLite lo aceptaría) |
| `CHECK` con nombre (`chk_products_stock`...) | El nombre llega en el error y la API lo traduce a un 409 claro |
| Índice parcial `uq_orders_customer_coupon_active` | Un cupón por cliente en órdenes **no canceladas**; cancelar libera el cupón |
| Trigger `trg_orders_status_transition` | La BD solo permite PENDING→PAID→SHIPPED→DELIVERED y cancelar desde PENDING/PAID |
| Trigger `trg_orders_amounts_immutable` | Los montos de una orden no se reescriben después de creada |
| `line_total_cents GENERATED ALWAYS` | El total por línea lo calcula la BD |
| `sessions.token_hash` | Se guarda el SHA-256 del token: una copia robada de la BD no sirve para entrar |

## Transacciones (`BEGIN` / `COMMIT` / `ROLLBACK`)

`withTransaction(work)` en `src/db.js` ejecuta `work` con `BEGIN IMMEDIATE`; si lanza un error hay `ROLLBACK`, si termina hay `COMMIT`.

| Operación | Tablas que toca en una sola transacción |
| --- | --- |
| Crear orden | `orders`, `order_items`, `products` (stock), `stock_movements` (SALE), `coupons` (uso) |
| Cancelar orden | `products` (stock), `stock_movements` (CANCELLATION), `coupons`, `orders` |
| Registro | `customers`, `users`, `sessions` |
| Crear / reponer / borrar producto | `products`, `stock_movements` |
| Editar / borrar cliente | `customers`, `users` |

**¿Por qué no hay `SELECT ... FOR UPDATE`?** SQLite no lo tiene ni lo necesita: `better-sqlite3` es síncrono, así que dentro
de la transacción no hay `await` y ninguna otra petición se ejecuta en medio. `IMMEDIATE` toma el bloqueo de escritura al
empezar por si otro proceso abre el mismo archivo. Verificado: 10 compras simultáneas del último stock (5 uds.) → 5 × 201 y 5 × 409.

## Métricas: `GET /api/resumen`

Calculadas por SQLite con `COUNT`, `SUM`, `AVG`, `GROUP BY` y `LEFT JOIN` (`src/repositories/summary.repository.js`),
todas dentro de una misma transacción de lectura para que las cifras cuadren entre sí:

ventas totales y ticket promedio · órdenes por estado y tasa de cancelación · productos más vendidos · mejores clientes ·
ventas por zona de envío · uso de cupones · inventario (unidades, valor, agotados) · ventas por día (`?dias=7|14|30`).

## Autenticación y permisos

- Login → `scrypt` verifica → token aleatorio de 32 bytes: al navegador va en una cookie `httpOnly; SameSite=Lax`
  (`Secure` en producción); a la BD va solo su SHA-256, con vencimiento de 7 días.
- Mismo mensaje y mismo tiempo de respuesta para email inexistente y contraseña incorrecta.
- Límite de intentos: 5 por cuenta y 20 por IP cada 15 minutos → `429`.
- La API aplica los permisos: un cliente solo ve y cancela **sus** órdenes (las ajenas dan `404`) y siempre compra a su nombre.

| Rol | Puede |
| --- | --- |
| Visitante | Ver catálogo, zonas de envío y validar cupones |
| Cliente | Comprar, ver y cancelar sus órdenes, usar el asistente |
| Administración | Todo lo anterior + inventario, clientes, todas las órdenes, cambios de estado y resumen |

## Asistente de IA (n8n)

```text
Navegador → POST /api/agent/chat (cookie) → Webhook n8n (X-Webhook-Secret) → Validar → AI Agent → { ok, data, error }
                                                                                  │
                     herramientas (solo GET) → API con X-Service-Token + X-Customer-Id
```

- El backend agrega el cliente **desde la sesión**; n8n lo envía a las herramientas en `X-Customer-Id` y el modelo no puede
  cambiarlo. Si alguien le pide al agente la orden de otra persona, la API le responde 404.
- Herramientas: `consultar_catalogo`, `consultar_mis_ordenes`, `consultar_orden`, `validar_cupon`, `consultar_zonas_envio`.
- Modelo principal DeepSeek con respaldo Gemini; memoria de 10 mensajes por usuario y conversación.

| Credencial en n8n | Tipo | Debe coincidir con |
| --- | --- | --- |
| `Webhook tienda Lab2 (Header Auth)` | Header `X-Webhook-Secret` | `N8N_WEBHOOK_SECRET` del backend |
| `API Circuito (token de servicio)` | Header `X-Service-Token` | `AGENT_SERVICE_TOKEN` del backend |
| `DeepSeek account` / `Google Gemini(PaLM) Api account` | Modelos | — |

## Interfaz

- **Logo** (`shared/components/Logo.jsx`, `public/favicon.svg`): una "C" trazada como pista de circuito con un nodo central
  en el único color de acento. Se dibuja al cargar el login.
- **Animaciones** (solo CSS, `styles/index.css`): entrada de página, escalonado de listas, barras que crecen desde su base,
  sacudida en error de login, pulso del carrito, menú móvil. Se desactivan con `prefers-reduced-motion`.
- **Responsive**: menú móvil animado y tablas con desplazamiento propio; sin desbordes a 390 px.

## Datos de prueba

| Para probar | Usa |
| --- | --- |
| Sin stock (409) | producto `WEB-001` |
| Cupón vencido / agotado (409) | `VENCIDO20` / `AGOTADO15` |
| Compra mínima (400) | `AHORRA5000` con menos de ₡30 000 |
| Cupón válido | `BIENVENIDA10`, `AHORRA5000` (hasta el 31/12/2026) |
| Borrar con historial (409) | `DELETE /api/products/1` · `DELETE /api/customers/1` |
| Orden ajena (404) | como Carlos, abrir `/ordenes/1` (es de Ana) |
