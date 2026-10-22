import { useEffect, useState } from 'react';

/** Devuelve `value` solo cuando dejó de cambiar durante `delayMs` (útil en buscadores). */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
