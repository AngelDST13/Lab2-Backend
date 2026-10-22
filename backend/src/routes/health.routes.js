import { Router } from 'express';
import { db } from '../db.js';
import { sendError, sendSuccess } from '../utils/response.js';

// Endpoint de infraestructura: no tiene lógica de negocio, por eso no lleva controller ni service.
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  try {
    db.prepare('SELECT 1').get();
    sendSuccess(res, { status: 'up', database: 'up' });
  } catch {
    sendError(res, 503, 'La base de datos no responde');
  }
});
