// Íconos de línea de cada diapositiva. Cada trazo se dibuja al aparecer:
// pathLength = 1 hace que el largo del trazo valga 1 y animate-draw lo recorre de 1 a 0.
const DRAWINGS = {
  chip: (p) => (
    <>
      <rect {...p} x="14" y="14" width="20" height="20" />
      <path {...p} d="M19 14V8M24 14V8M29 14V8M19 40v-6M24 40v-6M29 40v-6M14 19H8M14 24H8M14 29H8M40 19h-6M40 24h-6M40 29h-6" />
    </>
  ),
  route: (p) => (
    <>
      <path {...p} d="M8 36c8 0 8-12 16-12s8-12 16-12" />
      <circle {...p} cx="8" cy="36" r="3" />
      <path {...p} d="M40 6v8M36 10l4-4 4 4" />
    </>
  ),
  ticket: (p) => (
    <>
      <path {...p} d="M6 14h36v6a4 4 0 0 0 0 8v6H6v-6a4 4 0 0 0 0-8z" />
      <path {...p} d="M20 19l8 10M28 19l-8 10" />
    </>
  ),
  chat: (p) => (
    <>
      <path {...p} d="M8 10h32v20H22l-8 8v-8H8z" />
      <path {...p} d="M15 18h18M15 23h11" />
    </>
  ),
};

const strokeProps = { pathLength: 1, className: 'animate-draw [stroke-dasharray:1]' };

export function SlideIcon({ name }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="size-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DRAWINGS[name](strokeProps)}
    </svg>
  );
}
