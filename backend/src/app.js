import './schemas/zodSpanish.js';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { agentRouter } from './routes/agent.routes.js';
import { authenticate } from './middlewares/auth.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { couponsRouter } from './routes/coupons.routes.js';
import { customersRouter } from './routes/customers.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { productsRouter } from './routes/products.routes.js';
import { shippingRouter } from './routes/shipping.routes.js';
import { summaryRouter } from './routes/summary.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  // credentials: true → el navegador envía la cookie de sesión; exige orígenes explícitos (nunca "*")
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()), credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(authenticate);

  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/shipping-zones', shippingRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/agent', agentRouter);
  app.use('/api/resumen', summaryRouter);

  // Siempre al final: ruta inexistente → 404, cualquier error → JSON con el contrato
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
