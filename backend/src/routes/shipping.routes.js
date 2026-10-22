import { Router } from 'express';
import * as shippingController from '../controllers/shipping.controller.js';

export const shippingRouter = Router();

shippingRouter.get('/', shippingController.listZones);
