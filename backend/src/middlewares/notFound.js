import { sendError } from '../utils/response.js';

export function notFound(req, res) {
  sendError(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
}
