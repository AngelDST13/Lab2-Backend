import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import * as couponsController from '../controllers/coupons.controller.js';
import { couponParamsSchema, validateCouponQuerySchema } from '../schemas/coupons.schema.js';

export const couponsRouter = Router();

couponsRouter.get(
  '/:code/validate',
  validate({ params: couponParamsSchema, query: validateCouponQuerySchema }),
  couponsController.validate,
);
