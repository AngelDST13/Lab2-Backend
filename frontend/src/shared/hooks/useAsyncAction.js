import { useCallback, useState } from 'react';

/**
 * Para acciones que el usuario dispara (crear, cancelar, enviar).
 * `run` devuelve el resultado, o undefined si falló (el error queda en `error`).
 *
 * @template {unknown[]} A
 * @template R
 * @param {(...args: A) => Promise<R>} action
 */
export function useAsyncAction(action) {
  const [state, setState] = useState({ loading: false, error: null });

  const run = useCallback(
    async (...args) => {
      setState({ loading: true, error: null });
      try {
        const result = await action(...args);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error });
        return undefined;
      }
    },
    [action],
  );

  const resetError = useCallback(() => setState((previous) => ({ ...previous, error: null })), []);

  return { ...state, run, resetError };
}
