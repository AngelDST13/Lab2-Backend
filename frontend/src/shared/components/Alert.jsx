const TONES = {
  error: 'border-danger text-danger',
  success: 'border-ok text-ok',
  info: 'border-ink-soft text-ink-soft',
};

// Convierte cada detalle del backend en una línea legible.
function describeDetail(detail) {
  if (detail.message) return detail.message;
  if (detail.name) return `${detail.name}: pediste ${detail.requested}, quedan ${detail.available}`;
  return JSON.stringify(detail);
}

export function Alert({ tone = 'info', title, error, children }) {
  const message = error?.message ?? children;
  const details = Array.isArray(error?.details) ? error.details : [];

  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`border-l-2 bg-card py-3 pr-4 pl-4 text-sm ${TONES[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      <p className="text-ink-soft">{message}</p>
      {details.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-ink-soft">
          {details.map((detail, index) => (
            <li key={index}>— {describeDetail(detail)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
