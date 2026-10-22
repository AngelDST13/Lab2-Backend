import { API_URL } from '../config/env.js';

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Único lugar del frontend que llama a fetch. Entiende el formato de la API:
 * éxito (2xx) → devuelve el cuerpo tal cual; error → lanza ApiError con el
 * mensaje de { "error": "..." } y sus "details" si los hay.
 *
 * @param {string} path
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal, timeoutMs?: number }} [options]
 */
export async function apiRequest(path, { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      // Envía la cookie de sesión (httpOnly) aunque la API esté en otro puerto
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: combinedSignal,
    });
  } catch (err) {
    // Cancelado por el componente (se desmontó o cambió la búsqueda): no es un error real
    if (signal?.aborted) throw err;
    if (timeoutSignal.aborted) {
      throw new ApiError('El servidor tardó demasiado en responder');
    }
    throw new ApiError('No se pudo conectar con el servidor');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Error inesperado (${response.status})`, {
      status: response.status,
      details: payload?.details,
    });
  }
  if (payload === null) {
    throw new ApiError('Respuesta inválida del servidor', { status: response.status });
  }
  return payload;
}

/** Convierte { a: 1, b: '' } en "?a=1" ignorando valores vacíos. */
export function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
