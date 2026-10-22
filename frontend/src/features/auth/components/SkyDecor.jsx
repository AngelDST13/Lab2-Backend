// Fondo del panel de marca: de día un sol que asoma; de noche estrellas que titilan
// y una luna. Ambas capas están siempre montadas y se cruzan con opacidad al cambiar de tema.

const STARS = [
  [12, 14, 1.2, '0s'],
  [22, 38, 0.8, '0.8s'],
  [35, 9, 1, '1.6s'],
  [48, 27, 0.7, '0.4s'],
  [63, 12, 1.1, '1.2s'],
  [74, 34, 0.8, '2s'],
  [86, 18, 1.3, '0.6s'],
  [92, 44, 0.7, '1.4s'],
  [8, 52, 0.9, '1s'],
  [57, 48, 0.6, '1.8s'],
];

const CIRCUIT_PATH = 'M0 160H140L190 110H320L360 70H400';

export function SkyDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Día: sol grande y difuso */}
      <div className="absolute -top-40 -right-40 size-112 rounded-full bg-accent/25 blur-3xl transition-opacity duration-700 dark:opacity-0" />
      <div className="absolute top-16 right-16 size-24 rounded-full border border-current/15 transition-all duration-700 dark:scale-50 dark:opacity-0" />

      {/* Noche: estrellas y luna */}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-2/3 w-full opacity-0 transition-opacity duration-700 dark:opacity-100">
        {STARS.map(([x, y, r, delay]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r / 4} fill="currentColor" className="animate-twinkle" style={{ animationDelay: delay }} />
        ))}
      </svg>
      <svg viewBox="0 0 40 40" className="absolute top-14 right-16 size-16 scale-50 opacity-0 transition-all duration-700 dark:scale-100 dark:opacity-80">
        <path d="M27 6a15 15 0 1 0 7 26A13 13 0 0 1 27 6z" fill="currentColor" />
      </svg>

      {/* Pista de circuito con una señal que la recorre */}
      <svg className="absolute -right-24 bottom-24 w-136 opacity-15" viewBox="0 0 400 200" fill="none">
        <path
          d={CIRCUIT_PATH}
          pathLength="1"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-draw [stroke-dasharray:1]"
          style={{ animationDuration: '1600ms' }}
        />
        <circle cx="190" cy="110" r="5" fill="currentColor" />
        <circle cx="320" cy="110" r="5" className="fill-accent" />
      </svg>
      <svg className="absolute -right-24 bottom-24 w-136 motion-reduce:hidden" viewBox="0 0 400 200" fill="none">
        {/* Invisible hasta que la pista termina de dibujarse; luego la recorre en bucle */}
        <circle r="4" opacity="0" className="fill-accent">
          <set attributeName="opacity" to="1" begin="1.6s" />
          <animateMotion dur="5s" begin="1.6s" repeatCount="indefinite" path={CIRCUIT_PATH} />
        </circle>
      </svg>
    </div>
  );
}
