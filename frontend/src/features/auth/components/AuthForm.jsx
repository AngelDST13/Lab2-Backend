import { useState } from 'react';
import { Alert, Button, FormField, inputClassName } from '../../../shared/index.js';
import { PasswordInput } from './PasswordInput.jsx';

const EMPTY_FORM = { fullName: '', email: '', password: '' };

/**
 * Formulario único para ingresar o crear cuenta.
 * `attempt` cambia en cada error para volver a disparar la animación de "sacudida".
 */
export function AuthForm({ mode, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const isRegister = mode === 'register';
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(
        isRegister
          ? { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password }
          : { email: form.email.trim(), password: form.password },
      );
    } catch (submitError) {
      setError(submitError);
      setAttempt((count) => count + 1);
      setSubmitting(false);
    }
  }

  return (
    <form
      key={attempt}
      onSubmit={handleSubmit}
      className={`space-y-5 ${attempt > 0 ? 'animate-shake' : ''}`}
    >
      {isRegister && (
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

      <Button type="submit" className="w-full" loading={submitting}>
        {isRegister ? 'Crear cuenta' : 'Ingresar'}
      </Button>
    </form>
  );
}
