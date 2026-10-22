import { useState } from 'react';
import { sendAgentMessage } from '../services/agentApi.js';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hola. Soy el asistente automático de la tienda: puedo revisar precios y existencias, validar cupones, calcular envíos y decirte cómo va una orden.',
};

let nextMessageId = 0;
const createMessage = (role, text) => ({ id: `m${++nextMessageId}`, role, text });

export function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [sending, setSending] = useState(false);
  // sessionId permite que n8n recuerde la conversación (memoria del AI Agent)
  const [sessionId] = useState(() => crypto.randomUUID());

  async function send(text) {
    const message = text.trim();
    if (!message || sending) return;

    setMessages((current) => [...current, createMessage('user', message)]);
    setSending(true);
    try {
      const data = await sendAgentMessage({ message, sessionId });
      setMessages((current) => [...current, createMessage('assistant', data?.reply || 'No tengo una respuesta para eso.')]);
    } catch (error) {
      setMessages((current) => [...current, createMessage('error', error.message)]);
    } finally {
      setSending(false);
    }
  }

  return { messages, sending, send };
}
