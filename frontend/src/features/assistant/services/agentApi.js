import { apiRequest } from '../../../services/apiClient.js';

// El navegador habla con NUESTRO backend; solo el backend conoce el webhook de n8n.
// Timeout mayor que el del backend (60 s) para que el error lo explique el servidor.
export const sendAgentMessage = ({ message, sessionId }) =>
  apiRequest('/api/agent/chat', { method: 'POST', body: { message, sessionId }, timeoutMs: 65_000 });
