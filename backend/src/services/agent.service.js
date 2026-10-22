import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Un agente con herramientas hace varias llamadas al modelo por pregunta (más reintentos
// si el proveedor está saturado), por eso el margen es mayor que en una petición normal.
const AGENT_TIMEOUT_MS = 60_000;

/**
 * Reenvía el mensaje al webhook del AI Agent en n8n.
 * El backend actúa de puente: el navegador nunca conoce la URL ni el secreto del webhook.
 * Se envía quién pregunta (tomado de la sesión, nunca del cuerpo) para que las
 * herramientas del agente consulten solo los datos de ese cliente.
 * n8n responde con el contrato { ok, data: { reply }, error }.
 */
export async function chat({ message, sessionId }, user) {
  if (!env.N8N_WEBHOOK_URL) {
    throw new AppError(503, 'El asistente no está configurado');
  }

  const customer = user.customerId ? { id: user.customerId, name: user.displayName } : null;

  let response;
  try {
    response = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.N8N_WEBHOOK_SECRET && { 'X-Webhook-Secret': env.N8N_WEBHOOK_SECRET }),
      },
      // La memoria del agente se separa por usuario + conversación
      body: JSON.stringify({ message, sessionId: `${user.id}:${sessionId}`, customer }),
      signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new AppError(504, 'El asistente tardó demasiado en responder. Intenta de nuevo.');
    }
    throw new AppError(502, 'No se pudo contactar al asistente');
  }

  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload.ok !== 'boolean') {
    throw new AppError(502, 'El asistente respondió en un formato inválido');
  }
  if (!response.ok || !payload.ok) {
    throw new AppError(502, payload.error?.message ?? 'El asistente respondió con un error');
  }

  return payload.data;
}
