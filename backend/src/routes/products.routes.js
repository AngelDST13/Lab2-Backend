import { Router } from 'express';
import { idParamSchema } from '../schemas/common.schema.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as productsController from '../controllers/products.controller.js';
import {
  createProductSchema,
  listProductsQuerySchema,
  restockSchema,
  updateProductSchema,
} from '../schemas/products.schema.js';

export const productsRouter = Router();

// Catálogo público
productsRouter.get('/', validate({ query: listProductsQuerySchema }), productsController.list);
productsRouter.get('/:id', validate({ params: idParamSchema }), productsController.getById);

// Gestión de inventario: solo administración
const adminOnly = requireAuth('ADMIN');

productsRouter.get('/:id/movements', adminOnly, validate({ params: idParamSchema }), productsController.listMovements);
productsRouter.post('/', adminOnly, validate({ body: createProductSchema }), productsController.create);
productsRouter.patch(
  '/:id',
  adminOnly,
  validate({ params: idParamSchema, body: updateProductSchema }),
  productsController.update,
);
productsRouter.delete('/:id', adminOnly, validate({ params: idParamSchema }), productsController.remove);
productsRouter.post(
  '/:id/restock',
  adminOnly,
  validate({ params: idParamSchema, body: restockSchema }),
  productsController.restock,
);
