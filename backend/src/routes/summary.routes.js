import { Router } from 'express';
import * as summaryController from '../controllers/summary.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { summaryQuerySchema } from '../schemas/summary.schema.js';

// GET /api/resumen?dias=14 — métricas del negocio (solo administración)
export const summaryRouter = Router();

summaryRouter.get('/', requireAuth('ADMIN'), validate({ query: summaryQuerySchema }), summaryController.getSummary);
