import { Router } from 'express';
import { rateLimit } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import * as authController from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Contra fuerza bruta: por IP y por cuenta, para que cambiar de IP no alcance.
const loginLimiterByIp = rateLimit({ windowMs: FIFTEEN_MINUTES, max: 20 });
const loginLimiterByAccount = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  key: (req) => `login:${String(req.body?.email ?? '').trim().toLowerCase()}`,
  message: 'Demasiados intentos para esta cuenta. Espera 15 minutos.',
});
const registerLimiter = rateLimit({ windowMs: ONE_HOUR, max: 10 });

authRouter.post('/login', loginLimiterByIp, loginLimiterByAccount, validate({ body: loginSchema }), authController.login);
authRouter.post('/register', registerLimiter, validate({ body: registerSchema }), authController.register);
authRouter.post('/logout', authController.logout);
// "¿Quién soy?" no es un error para un visitante: responde 200 con user: null
authRouter.get('/me', authController.me);
