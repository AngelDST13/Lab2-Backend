import { Link, useParams } from 'react-router';
import { Alert, LoadingState, TotalsSummary, formatDate, formatMoney, useFetch } from '../../../shared/index.js';
import { OrderActions } from '../components/OrderActions.jsx';
import { OrderStatusBadge } from '../components/OrderStatusBadge.jsx';
import { getOrder } from '../services/ordersApi.js';
import { formatOrderNumber } from '../utils/orderStatus.js';

function Meta({ label, children }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, loading, error, refetch } = useFetch((signal) => getOrder(id, signal), [id]);

  if (loading && !order) return <LoadingState label="Cargando orden" />;
  if (error) return <Alert tone="error" title="No pudimos abrir la orden" error={error} />;

  return (
    <>
      <Link to="/ordenes" className="label-caps hover:text-ink">
        ← Todas las órdenes
      </Link>

      <header className="mt-4 mb-8 border-b border-ink pb-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Orden <span className="font-mono text-3xl font-normal sm:text-4xl">{formatOrderNumber(order.id)}</span>
        </h1>
        <dl className="mt-6 grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
          <Meta label="Estado">
            <OrderStatusBadge status={order.status} />
          </Meta>
          <Meta label="Cliente">{order.customerName}</Meta>
          <Meta label="Envío">{order.shippingZoneName}</Meta>
          <Meta label="Fecha">{formatDate(order.createdAt)}</Meta>
        </dl>
      </header>

      {order.status === 'CANCELLED' && (
        <div className="mb-8">
          <Alert tone="info" title={`Cancelada el ${formatDate(order.cancelledAt)}`}>
            Motivo: {order.cancelReason}
          </Alert>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Productos de la orden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="label-caps pb-3 pr-4 font-normal">Producto</th>
                <th scope="col" className="label-caps pb-3 pr-4 text-right font-normal">Precio</th>
                <th scope="col" className="label-caps pb-3 pr-4 text-right font-normal">Uds.</th>
                <th scope="col" className="label-caps pb-3 text-right font-normal">Importe</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-line">
                  <td className="py-4 pr-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="font-mono text-xs text-muted">{item.sku}</p>
                  </td>
                  <td className="py-4 pr-4 text-right font-mono tabular">{formatMoney(item.unitPrice)}</td>
                  <td className="py-4 pr-4 text-right font-mono tabular">{item.quantity}</td>
                  <td className="py-4 text-right font-mono tabular">{formatMoney(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 ml-auto max-w-sm">
            <TotalsSummary {...order} />
          </div>
        </section>

        <OrderActions order={order} onChanged={refetch} />
      </div>
    </>
  );
}
