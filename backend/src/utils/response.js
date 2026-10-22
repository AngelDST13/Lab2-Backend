// Formato de la API:
//   éxito → el recurso tal cual (objeto o arreglo)
//   error → { "error": "mensaje" } y, si aplica, "details" con el detalle por campo o producto.
// (El contrato { ok, data, error } es exclusivo del webhook de n8n.)

export function sendSuccess(res, data, status = 200) {
  return res.status(status).json(data);
}

export function sendError(res, status, message, details) {
  return res.status(status).json(details === undefined ? { error: message } : { error: message, details });
}
