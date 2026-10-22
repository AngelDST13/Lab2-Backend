import { Router } from 'express';
import { rateLimit } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as agentController from '../controllers/agent.controller.js';
import { chatSchema } from '../schemas/agent.schema.js';

export const agentRouter = Router();

// Cada mensaje cuesta llamadas al modelo de IA: límite por usuario.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  key: (req) => `agent:${req.user.id}`,
  message: 'Enviaste muchos mensajes seguidos. Espera un minuto.',
});

agentRouter.post('/chat', requireAuth(), chatLimiter, validate({ body: chatSchema }), agentController.chat);
