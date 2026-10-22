import { Router } from 'express';
import { idParamSchema } from '../schemas/common.schema.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as ordersController from '../controllers/orders.controller.js';
import {
  cancelOrderSchema,
  listOrdersQuerySchema,
  orderInputSchema,
  updateOrderStatusSchema,
} from '../schemas/orders.schema.js';

export const ordersRouter = Router();

// Toda la sección de órdenes requiere sesión
ordersRouter.use(requireAuth());

ordersRouter.get('/', validate({ query: listOrdersQuerySchema }), ordersController.list);
// /quote va antes de /:id para que "quote" no se interprete como un id
ordersRouter.post('/quote', validate({ body: orderInputSchema }), ordersController.quote);
ordersRouter.get('/:id', validate({ params: idParamSchema }), ordersController.getById);
ordersRouter.post('/', validate({ body: orderInputSchema }), ordersController.create);
ordersRouter.post(
  '/:id/cancel',
  validate({ params: idParamSchema, body: cancelOrderSchema }),
  ordersController.cancel,
);
ordersRouter.patch(
  '/:id/status',
  requireAuth('ADMIN'),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  ordersController.updateStatus,
);
