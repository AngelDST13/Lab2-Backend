/**
 * Memoria corta de las conversaciones con el asistente.
 *
 * Se guarda aquí (y no en n8n) solo el TEXTO de cada intercambio: el historial que
 * recibe el modelo nunca contiene llamadas a herramientas a medias, que es lo que
 * rompía la conversación cuando la memoria de n8n recortaba mensajes viejos.
 * Como la escribe el servidor, el navegador no puede inventar mensajes anteriores.
 *
 * Vive en memoria del proceso: al reiniciar la API las conversaciones empiezan de cero.
 */
const MAX_TURNS = 6; // últimos 6 intercambios = 12 mensajes
const TTL_MS = 30 * 60 * 1000; // 30 minutos sin actividad
const MAX_CONVERSATIONS = 5_000;

/** @type {Map<string, { messages: { role: 'user' | 'assistant', text: string }[], expiresAt: number }>} */
const conversations = new Map();

function purgeExpired(now) {
  for (const [key, conversation] of conversations) {
    if (conversation.expiresAt <= now) conversations.delete(key);
  }
}

export function getHistory(key) {
  const conversation = conversations.get(key);
  if (!conversation || conversation.expiresAt <= Date.now()) return [];
  return conversation.messages;
}

export function appendTurn(key, userText, assistantText) {
  const now = Date.now();
  if (conversations.size >= MAX_CONVERSATIONS) purgeExpired(now);

  const messages = [...getHistory(key), { role: 'user', text: userText }, { role: 'assistant', text: assistantText }];
  conversations.set(key, { messages: messages.slice(-MAX_TURNS * 2), expiresAt: now + TTL_MS });
}
