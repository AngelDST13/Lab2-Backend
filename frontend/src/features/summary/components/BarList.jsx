/**
 * Barras horizontales de una sola serie (magnitud): un solo tono, el valor siempre
 * escrito como texto y un tooltip con el detalle al pasar el mouse o enfocar la fila.
 *
 * @param {{ title: string, rows: { key: string|number, label: string, value: number, display: string, detail?: string }[] }} props
 */
export function BarList({ title, rows, emptyText = 'Sin datos todavía' }) {
  const max = Math.max(...rows.map((row) => row.value), 0);

  return (
    <section className="border-t border-ink pt-4">
      <h2 className="label-caps mb-4">{title}</h2>
      {rows.length === 0 || max === 0 ? (
        <p className="py-6 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li
              key={row.key}
              tabIndex={0}
              style={{ '--i': index }}
              className="group stagger animate-rise relative focus:outline-none"
            >
              <div className="mb-1 flex items-baseline justify-between gap-4 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="font-mono tabular text-ink-soft">{row.display}</span>
              </div>
              <div className="h-2 bg-paper-deep">
                <div
                  className="h-full origin-left rounded-r-sm bg-ink transition-[width] duration-700 ease-out-soft group-hover:bg-accent group-focus-visible:bg-accent"
                  // Un valor pequeño se ve (mínimo 1,5 %), pero un cero no dibuja barra
                  style={{ width: row.value === 0 ? 0 : `${Math.max((row.value / max) * 100, 1.5)}%` }}
                />
              </div>
              {row.detail && (
                <p
                  role="tooltip"
                  className="pointer-events-none absolute right-0 -top-8 z-10 bg-ink px-2 py-1 font-mono text-xs whitespace-nowrap text-card opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {row.detail}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
