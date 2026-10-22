import { useCallback, useState } from 'react';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Estado de un slider que avanza solo. No usa setInterval: la barra de progreso
 * de la diapositiva activa es una animación CSS y, al terminar, llama a `next`.
 * Así pausar es solo cambiar animation-play-state.
 *
 * Con "reducir movimiento" activado no avanza solo: se cambia a mano.
 */
export function useAutoSlider(count) {
  const [canAutoplay] = useState(() => !prefersReducedMotion());
  const [index, setIndex] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [hovered, setHovered] = useState(false);

  const next = useCallback(() => setIndex((current) => (current + 1) % count), [count]);
  const previous = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count]);
  const goTo = useCallback((target) => setIndex(target), []);
  const togglePause = useCallback(() => setPausedByUser((paused) => !paused), []);

  return {
    index,
    next,
    previous,
    goTo,
    canAutoplay,
    pausedByUser,
    togglePause,
    // Se detiene mientras el mouse o el foco están encima, para poder leer con calma
    paused: !canAutoplay || pausedByUser || hovered,
    hoverHandlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setHovered(true),
      onBlur: () => setHovered(false),
    },
  };
}
