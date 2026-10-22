import { STORE } from '../../config/env.js';

/**
 * Logo de Circuito: una "C" trazada como pista de circuito impreso. El trazo
 * deja una abertura por donde sale una conexión, que termina en un punto de soldadura.
 * El nodo central, en color de acento, es el único elemento de color de la marca.
 *
 * `animated` dibuja el trazo al montarse (stroke-dashoffset con pathLength=1).
 */
export function LogoMark({ animated = false, className = 'size-8' }) {
  const drawClass = animated ? 'animate-draw [stroke-dasharray:1]' : '';

  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M23.78 8.22A11 11 0 1 0 23.78 23.78"
        pathLength="1"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className={drawClass}
      />
      <path
        d="M16 16H26.5"
        pathLength="1"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className={drawClass}
        style={animated ? { animationDelay: '450ms' } : undefined}
      />
      <circle cx="27.2" cy="16" r="2" fill="currentColor" />
      <circle cx="16" cy="16" r="3.2" className="fill-accent" />
    </svg>
  );
}

const SIZES = {
  md: { mark: 'size-7', text: 'text-2xl' },
  lg: { mark: 'size-11', text: 'text-4xl' },
};

export function Logo({ animated = false, size = 'md', inverted = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${inverted ? 'text-card' : 'text-ink'}`}>
      <LogoMark animated={animated} className={SIZES[size].mark} />
      <span className={`font-display font-semibold tracking-tight ${SIZES[size].text}`}>{STORE.name}</span>
    </span>
  );
}
