import { Router } from 'express';
import * as customersController from '../controllers/customers.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customers.schema.js';
import { listOrdersQuerySchema } from '../schemas/orders.schema.js';

// Datos personales: solo administración. Los clientes se registran por /api/auth/register.
export const customersRouter = Router();

customersRouter.use(requireAuth('ADMIN'));
customersRouter.get('/', customersController.list);
customersRouter.get('/:id', validate({ params: idParamSchema }), customersController.getById);
customersRouter.get(
  '/:id/orders',
  validate({ params: idParamSchema, query: listOrdersQuerySchema.omit({ customerId: true }) }),
  customersController.listOrders,
);
customersRouter.post('/', validate({ body: createCustomerSchema }), customersController.create);
customersRouter.patch('/:id', validate({ params: idParamSchema, body: updateCustomerSchema }), customersController.update);
customersRouter.delete('/:id', validate({ params: idParamSchema }), customersController.remove);
