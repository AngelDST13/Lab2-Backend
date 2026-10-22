import { useCallback, useEffect, useState } from 'react';

/**
 * Ejecuta `fetcher` al montar y cada vez que cambian `deps`.
 * Cancela la petición anterior (AbortController) para evitar respuestas viejas.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} fetcher
 * @param {unknown[]} deps
 * @returns {{ data: T | null, error: Error | null, loading: boolean, refetch: () => void }}
 */
export function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ data: null, error, loading: false });
      });

    return () => controller.abort();
    // `fetcher` cambia en cada render; las dependencias reales las declara quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, refetch };
}
