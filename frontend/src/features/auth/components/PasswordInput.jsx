import { useState } from 'react';
import { inputClassName } from '../../../shared/index.js';

export function PasswordInput({ id, value, onChange, autoComplete, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        maxLength={200}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={`${inputClassName} pr-20`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-pressed={visible}
        aria-controls={id}
        className="label-caps absolute inset-y-0 right-0 px-3 transition-colors hover:text-ink"
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
