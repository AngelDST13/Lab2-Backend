import { useId } from 'react';
import { useTheme } from '../theme/ThemeContext.jsx';

const STARS = [
  { x: 9, y: 7, delay: '0s' },
  { x: 15, y: 15, delay: '0.6s' },
  { x: 6, y: 18, delay: '1.2s' },
];

/**
 * Interruptor día/noche: la perilla se desliza y el sol se convierte en luna
 * (un círculo que "muerde" al sol y los rayos que se recogen). De noche aparecen estrellas.
 */
export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  // id único por instancia: el interruptor aparece en el encabezado y en el menú móvil
  const maskId = `moon-bite-${useId().replace(/:/g, '')}`;

  function handleClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Modo noche"
      title={isDark ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      onClick={handleClick}
      className={`relative h-8 w-15 shrink-0 border border-line bg-paper-deep transition-colors duration-500 hover:border-ink ${className}`}
    >
      {/* Estrellas del fondo (solo de noche) */}
      <svg viewBox="0 0 24 24" className="absolute top-1 left-1.5 size-5 text-ink" aria-hidden="true">
        {STARS.map((star) => (
          <circle
            key={`${star.x}-${star.y}`}
            cx={star.x}
            cy={star.y}
            r="0.9"
            fill="currentColor"
            style={{ animationDelay: star.delay }}
            className={`transition-opacity duration-500 ${isDark ? 'animate-twinkle' : 'opacity-0'}`}
          />
        ))}
      </svg>

      {/* Perilla que se desliza */}
      <span
        className={`absolute top-0.5 left-0.5 grid size-6.5 place-items-center bg-ink text-card transition-transform duration-500 ease-out-soft ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
          {/* Geometría como estilo (no atributo) para que CSS pueda animarla */}
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <circle
              fill="black"
              className="transition-all duration-500 ease-out-soft"
              style={{ r: 6, cx: isDark ? 16 : 30, cy: isDark ? 8 : 0 }}
            />
          </mask>
          <circle
            fill="currentColor"
            mask={`url(#${maskId})`}
            className="transition-all duration-500 ease-out-soft"
            style={{ cx: 12, cy: 12, r: isDark ? 8 : 4.5 }}
          />
          {/* Rayos del sol: giran y desaparecen al pasar a noche */}
          <g
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className={`origin-center transition-all duration-500 ease-out-soft ${isDark ? 'scale-50 rotate-90 opacity-0' : 'opacity-100'}`}
          >
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </g>
        </svg>
      </span>
    </button>
  );
}
