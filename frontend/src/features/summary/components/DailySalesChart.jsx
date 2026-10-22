import { formatMoney } from '../../../shared/index.js';

const dayLabel = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// El SQL solo devuelve los días con ventas; aquí se completan los días vacíos con 0
function fillDays(rows, days) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const today = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (days - 1 - index)));
    const key = date.toISOString().slice(0, 10);
    return { day: key, date, orders: byDay.get(key)?.orders ?? 0, revenue: byDay.get(key)?.revenue ?? 0 };
  });
}

export function DailySalesChart({ rows, days }) {
  const series = fillDays(rows, days);
  const max = Math.max(...series.map((point) => point.revenue), 0);
  const labelEvery = Math.ceil(days / 7);

  return (
    <section className="border-t border-ink pt-4">
      <h2 className="label-caps mb-6">Ventas por día · últimos {days} días</h2>

      {max === 0 ? (
        <p className="py-10 text-sm text-muted">No hubo ventas en este período.</p>
      ) : (
        <>
          <ol className="flex h-48 items-end gap-0.5 border-b border-line" aria-label="Ventas por día">
            {series.map((point, index) => (
              <li
                key={point.day}
                tabIndex={0}
                aria-label={`${dayLabel.format(point.date)}: ${formatMoney(point.revenue)} en ${point.orders} órdenes`}
                className="group relative flex h-full flex-1 items-end focus:outline-none"
              >
                {/* Área de hover más grande que la barra: toda la columna */}
                <div
                  style={{ height: `${(point.revenue / max) * 100}%`, animationDelay: `${index * 20}ms` }}
                  className={`w-full origin-bottom animate-grow-y rounded-t-sm transition-colors duration-150 ${
                    point.revenue > 0 ? 'bg-ink group-hover:bg-accent group-focus-visible:bg-accent' : ''
                  }`}
                />
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 bg-ink px-2 py-1 font-mono text-xs whitespace-nowrap text-card opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {dayLabel.format(point.date)} · {formatMoney(point.revenue)} · {point.orders} órd.
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2 flex gap-0.5 font-mono text-[10px] text-muted">
            {series.map((point, index) => (
              <span key={point.day} className="flex-1 text-center">
                {index % labelEvery === 0 || index === series.length - 1 ? dayLabel.format(point.date) : ''}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
