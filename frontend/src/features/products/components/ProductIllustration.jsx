// Ilustraciones de línea por categoría (prefijo del SKU). Sin fotos: el catálogo
// se lee como una lámina técnica y no depende de imágenes externas.

const KEY_ROWS = [0, 1, 2];
const KEY_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const DRAWINGS = {
  AUD: (
    <>
      <path d="M32 54V44a28 28 0 0 1 56 0v10" />
      <rect x="25" y="48" width="13" height="22" rx="4" />
      <rect x="82" y="48" width="13" height="22" rx="4" />
    </>
  ),
  TEC: (
    <>
      <rect x="14" y="24" width="92" height="36" rx="3" />
      {KEY_ROWS.map((row) =>
        KEY_COLUMNS.map((column) => (
          <rect key={`${row}-${column}`} x={20 + column * 9.4} y={30 + row * 8} width="6" height="5" rx="1" />
        )),
      )}
    </>
  ),
  MOU: (
    <>
      <rect x="44" y="12" width="32" height="56" rx="16" />
      <path d="M60 12v18M44 30h32" />
    </>
  ),
  MON: (
    <>
      <rect x="20" y="10" width="80" height="48" rx="2" />
      <path d="M60 58v10M44 70h32" />
    </>
  ),
  CAB: (
    <>
      <path d="M22 40c20-26 56 26 76 0" />
      <rect x="8" y="35" width="14" height="10" rx="2" />
      <rect x="98" y="35" width="14" height="10" rx="2" />
    </>
  ),
  WEB: (
    <>
      <circle cx="60" cy="34" r="17" />
      <circle cx="60" cy="34" r="6" />
      <path d="M60 51v12M46 66h28" />
    </>
  ),
};

const FALLBACK = <rect x="35" y="15" width="50" height="50" rx="2" />;

export function ProductIllustration({ sku, className = '' }) {
  const prefix = sku.split('-')[0];

  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DRAWINGS[prefix] ?? FALLBACK}
    </svg>
  );
}
