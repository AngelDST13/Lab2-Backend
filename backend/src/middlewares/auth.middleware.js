import { AppError } from '../utils/AppError.js';
import { readCookie } from '../utils/cookies.js';
import { getUserFromServiceToken, getUserFromSessionToken } from '../services/auth.service.js';

export const SESSION_COOKIE = 'circuito_session';

/**
 * Identifica a quien hace la petición y lo deja en req.user (o null si es anónimo).
 * No bloquea nada: eso lo decide requireAuth en cada ruta.
 */
export function authenticate(req, _res, next) {
  const serviceToken = req.get('X-Service-Token');

  if (serviceToken) {
    // El agente de n8n solo puede leer: nunca crea, modifica ni cancela.
    if (req.method !== 'GET') {
      throw new AppError(403, 'El token de servicio solo permite consultas');
    }
    req.user = getUserFromServiceToken(serviceToken, req.get('X-Customer-Id'));
    return next();
  }

  req.user = getUserFromSessionToken(readCookie(req, SESSION_COOKIE));
  next();
}

/**
 * Exige sesión y, opcionalmente, uno de los roles indicados.
 * 401 = no sé quién eres · 403 = sé quién eres, pero no puedes hacer esto.
 */
export const requireAuth =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      throw new AppError(401, 'Inicia sesión para continuar');
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new AppError(403, 'No tienes permiso para esta acción');
    }
    next();
  };
