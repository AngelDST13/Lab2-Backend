import { AppError } from '../utils/AppError.js';

const MAX_TRACKED_KEYS = 10_000;

/**
 * Limitador en memoria (ventana fija). Suficiente para un solo proceso;
 * con varias instancias habría que guardar los contadores en Redis o en la BD.
 *
 * @param {{ windowMs: number, max: number, key?: (req: import('express').Request) => string, message?: string }} options
 */
export function rateLimit({ windowMs, max, key = (req) => req.ip, message = 'Demasiados intentos. Espera unos minutos.' }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();

    if (hits.size > MAX_TRACKED_KEYS) {
      for (const [trackedKey, entry] of hits) if (entry.resetAt <= now) hits.delete(trackedKey);
    }

    const requestKey = key(req);
    const entry = hits.get(requestKey);
    if (!entry || entry.resetAt <= now) {
      hits.set(requestKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      throw new AppError(429, message);
    }
    next();
  };
}
