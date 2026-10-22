import { useEffect, useRef, useState } from 'react';
import { STORE } from '../../../config/env.js';
import { Button, PageHeader } from '../../../shared/index.js';
import { ChatMessage } from '../components/ChatMessage.jsx';
import { useChat } from '../hooks/useChat.js';

const FREQUENT_QUESTIONS = [
  '¿Cuántos monitores les quedan?',
  '¿En qué van mis órdenes?',
  '¿El cupón BIENVENIDA10 sirve para una compra de ₡20 000?',
  '¿Cuánto cuesta el envío a zona rural?',
];

export function AssistantPage() {
  const { messages, sending, send } = useChat();
  const [draft, setDraft] = useState('');
  const listEndRef = useRef(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, sending]);

  function submit(text) {
    send(text);
    setDraft('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit(draft);
  }

  return (
    <>
      <PageHeader
        eyebrow="Atención al cliente"
        title="Pregúntanos"
        description={`Asistente automático con datos reales de la tienda y de tus órdenes. No realiza compras ni cancelaciones. Para algo más, escribe a ${STORE.supportEmail}.`}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
        <section className="flex min-h-112 flex-col border-t border-ink">
          <ol className="flex-1 space-y-6 py-6" aria-live="polite">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {sending && (
              <li className="label-caps sm:pl-30">
                Consultando<span className="animate-pulse">…</span>
              </li>
            )}
            <li ref={listEndRef} aria-hidden="true" />
          </ol>

          <form onSubmit={handleSubmit} className="flex border border-ink bg-card">
            <label htmlFor="chat-input" className="sr-only">
              Escribe tu pregunta
            </label>
            <input
              id="chat-input"
              className="h-12 flex-1 bg-transparent px-4 text-sm focus:outline-none"
              placeholder="Escribe tu pregunta"
              maxLength={2000}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" loading={sending} disabled={!draft.trim()} className="h-12">
              Enviar
            </Button>
          </form>
        </section>

        <aside>
          <p className="label-caps mb-3">Preguntas frecuentes</p>
          <ul className="space-y-2 text-sm">
            {FREQUENT_QUESTIONS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => submit(question)}
                  className="text-left text-ink-soft underline decoration-line underline-offset-4 hover:text-ink hover:decoration-accent disabled:text-muted"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
