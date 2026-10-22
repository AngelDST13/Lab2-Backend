import { Link } from 'react-router';
import { formatDate, formatMoney } from '../../../shared/index.js';
import { formatOrderNumber } from '../utils/orderStatus.js';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';

export function OrdersTable({ orders, showCustomer }) {
  return (
    <div className="overflow-x-auto border-t border-ink">
      <table className="w-full min-w-150 text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="label-caps py-3 pr-4 font-normal">Orden</th>
            <th scope="col" className="label-caps py-3 pr-4 font-normal">Fecha</th>
            {showCustomer && <th scope="col" className="label-caps py-3 pr-4 font-normal">Cliente</th>}
            <th scope="col" className="label-caps py-3 pr-4 text-right font-normal">Uds.</th>
            <th scope="col" className="label-caps py-3 pr-4 font-normal">Estado</th>
            <th scope="col" className="label-caps py-3 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr
              key={order.id}
              style={{ '--i': Math.min(index, 12) }}
              className="stagger animate-rise border-b border-line transition-colors duration-200 hover:bg-card"
            >
              <td className="py-3 pr-4">
                <Link
                  to={`/ordenes/${order.id}`}
                  className="font-mono underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  {formatOrderNumber(order.id)}
                </Link>
              </td>
              <td className="py-3 pr-4 text-ink-soft">{formatDate(order.createdAt)}</td>
              {showCustomer && <td className="py-3 pr-4">{order.customerName}</td>}
              <td className="py-3 pr-4 text-right font-mono tabular">{order.itemCount}</td>
              <td className="py-3 pr-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-3 text-right font-mono tabular">{formatMoney(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
