import { STORE } from '../../../config/env.js';

const AUTHORS = {
  user: 'Tú',
  assistant: STORE.name,
  error: 'Aviso',
};

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <li className={`animate-rise grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-6 ${isUser ? 'text-ink' : 'text-ink-soft'}`}>
      <p className={`label-caps pt-1 ${message.role === 'error' ? 'text-danger' : ''}`}>{AUTHORS[message.role]}</p>
      <p
        className={`text-[0.95rem] leading-relaxed whitespace-pre-wrap ${
          isUser ? 'font-medium' : ''
        } ${message.role === 'error' ? 'text-danger' : ''}`}
      >
        {message.text}
      </p>
    </li>
  );
}
