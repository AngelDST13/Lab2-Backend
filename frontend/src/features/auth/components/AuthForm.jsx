import { useState } from 'react';
import { Alert, Button, FormField, inputClassName } from '../../../shared/index.js';
import { PasswordInput } from './PasswordInput.jsx';

const EMPTY_FORM = { fullName: '', email: '', password: '' };

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="animate-pop size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" className="animate-draw [stroke-dasharray:1]" />
    </svg>
  );
}

/**
 * Formulario único para ingresar o crear cuenta.
 * status: idle → submitting → success (check animado) o de vuelta a idle con error.
 * `attempt` cambia en cada error para volver a disparar la animación de "sacudida".
 */
export function AuthForm({ mode, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const isRegister = mode === 'register';
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit(
        isRegister
          ? { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password }
          : { email: form.email.trim(), password: form.password },
      );
      setStatus('success');
    } catch (submitError) {
      setError(submitError);
      setAttempt((count) => count + 1);
      setStatus('idle');
    }
  }

  return (
    <form key={attempt} onSubmit={handleSubmit} className={`space-y-5 ${attempt > 0 ? 'animate-shake' : ''}`}>
      {isRegister && (
        <div className="animate-rise">
          <FormField id="fullName" label="Nombre completo">
            <input
              id="fullName"
              required
              maxLength={120}
              autoComplete="name"
              className={inputClassName}
              value={form.fullName}
              onChange={updateField('fullName')}
            />
          </FormField>
        </div>
      )}

      <FormField id="email" label="Email">
        <input
          id="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          className={inputClassName}
          value={form.email}
          onChange={updateField('email')}
        />
      </FormField>

      <FormField id="password" label="Contraseña" hint={isRegister ? 'Mínimo 8 caracteres, con letras y números.' : undefined}>
        <PasswordInput
          id="password"
          value={form.password}
          onChange={updateField('password')}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          minLength={isRegister ? 8 : undefined}
        />
      </FormField>

      {error && <Alert tone="error" error={error} />}

      <Button
        type="submit"
        className={`w-full ${status === 'success' ? 'bg-ok! text-card!' : ''}`}
        loading={status === 'submitting'}
        disabled={status === 'success'}
      >
        {status === 'success' ? (
          <span className="inline-flex items-center gap-2">
            <CheckIcon /> {isRegister ? 'Cuenta creada' : 'Listo'}
          </span>
        ) : isRegister ? (
          'Crear cuenta'
        ) : (
          'Ingresar'
        )}
      </Button>
    </form>
  );
}
