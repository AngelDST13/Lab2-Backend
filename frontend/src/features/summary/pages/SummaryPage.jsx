import { useState } from 'react';
import { Alert, LoadingState, PageHeader, formatDate, formatMoney, useFetch } from '../../../shared/index.js';
import { STATUS_LABELS } from '../../orders/index.js';
import { BarList } from '../components/BarList.jsx';
import { DailySalesChart } from '../components/DailySalesChart.jsx';
import { StatTile } from '../components/StatTile.jsx';
import { getSummary } from '../services/summaryApi.js';

const PERIODS = [7, 14, 30];

function PeriodPicker({ value, onChange }) {
  return (
    <div role="group" aria-label="Período" className="flex border border-ink">
      {PERIODS.map((days) => (
        <button
          key={days}
          type="button"
          aria-pressed={value === days}
          onClick={() => onChange(days)}
          className={`h-9 px-4 font-mono text-xs transition-colors duration-200 ${
            value === days ? 'bg-ink text-card' : 'text-ink-soft hover:bg-paper-deep'
          }`}
        >
          {days} días
        </button>
      ))}
    </div>
  );
}

export function SummaryPage() {
  const [days, setDays] = useState(14);
  const { data, loading, error } = useFetch((signal) => getSummary(days, signal), [days]);

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Resumen"
        description="Métricas calculadas por la base de datos con COUNT, SUM y GROUP BY. Las órdenes canceladas no cuentan como venta."
        actions={<PeriodPicker value={days} onChange={setDays} />}
      />

      {loading && !data && <LoadingState label="Calculando métricas" />}
      {error && <Alert tone="error" error={error} />}

      {data && (
        <div className="space-y-14">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
            <StatTile index={0} label="Ventas" value={formatMoney(data.sales.revenue)} note={`${data.sales.orders} órdenes`} />
            <StatTile index={1} label="Ticket promedio" value={formatMoney(data.sales.averageTicket)} note="por orden" />
            <StatTile index={2} label="Descuentos" value={formatMoney(data.sales.discounts)} note="por cupones" />
            <StatTile
              index={3}
              label="Cancelación"
              value={`${data.sales.cancellationRate.toLocaleString('es-CR')} %`}
              note="de todas las órdenes"
            />
          </div>

          <DailySalesChart rows={data.dailySales.rows} days={data.dailySales.days} />

          <div className="grid gap-12 lg:grid-cols-2">
            <BarList
              title="Productos más vendidos"
              rows={data.topProducts.map((product) => ({
                key: product.id,
                label: product.name,
                value: product.unitsSold,
                display: `${product.unitsSold} uds.`,
                detail: `${product.sku} · ${formatMoney(product.revenue)}`,
              }))}
            />
            <BarList
              title="Mejores clientes"
              rows={data.topCustomers.map((customer) => ({
                key: customer.id,
                label: customer.name,
                value: customer.spent,
                display: formatMoney(customer.spent),
                detail: `${customer.orders} órdenes`,
              }))}
            />
            <BarList
              title="Ventas por zona de envío"
              rows={data.salesByZone.map((zone) => ({
                key: zone.zone,
                label: zone.zone,
                value: zone.revenue,
                display: formatMoney(zone.revenue),
                detail: `${zone.orders} órdenes · envío ${formatMoney(zone.shipping)}`,
              }))}
            />
            <BarList
              title="Órdenes por estado"
              rows={data.ordersByStatus.map((row) => ({
                key: row.status,
                label: STATUS_LABELS[row.status],
                value: row.orders,
                display: `${row.orders}`,
                detail: formatMoney(row.total),
              }))}
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <section className="border-t border-ink pt-4">
              <h2 className="label-caps mb-4">Inventario activo</h2>
              <dl className="grid grid-cols-2 gap-y-4 text-sm">
                <dt className="text-ink-soft">Productos</dt>
                <dd className="text-right font-mono tabular">{data.inventory.products}</dd>
                <dt className="text-ink-soft">Unidades en bodega</dt>
                <dd className="text-right font-mono tabular">{data.inventory.units}</dd>
                <dt className="text-ink-soft">Valor del inventario</dt>
                <dd className="text-right font-mono tabular">{formatMoney(data.inventory.stockValue)}</dd>
                <dt className="text-ink-soft">Agotados</dt>
                <dd className="text-right font-mono text-danger tabular">{data.inventory.outOfStock}</dd>
                <dt className="text-ink-soft">Con {data.inventory.lowStockThreshold} uds. o menos</dt>
                <dd className="text-right font-mono text-warn tabular">{data.inventory.lowStock}</dd>
              </dl>
            </section>

            <section className="border-t border-ink pt-4">
              <h2 className="label-caps mb-4">Uso de cupones</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="label-caps pb-2 font-normal">Cupón</th>
                    <th scope="col" className="label-caps pb-2 text-right font-normal">Usos</th>
                    <th scope="col" className="label-caps pb-2 text-right font-normal">Descontado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.couponUsage.map((coupon) => (
                    <tr key={coupon.code} className="border-b border-line">
                      <td className="py-2 font-mono">{coupon.code}</td>
                      <td className="py-2 text-right font-mono tabular">
                        {coupon.timesUsed}
                        {coupon.maxUses !== null && <span className="text-muted">/{coupon.maxUses}</span>}
                      </td>
                      <td className="py-2 text-right font-mono tabular">{formatMoney(coupon.totalDiscount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <p className="font-mono text-xs text-muted">Calculado el {formatDate(data.generatedAt)}</p>
        </div>
      )}
    </>
  );
}
