import { STATUS_LABELS } from '../utils/orderStatus.js';

const STATUS_COLORS = {
  PENDING: 'bg-warn',
  PAID: 'bg-ink',
  SHIPPED: 'bg-accent',
  DELIVERED: 'bg-ok',
  CANCELLED: 'bg-line',
};

export function OrderStatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs tracking-wide uppercase">
      <span className={`size-2 ${STATUS_COLORS[status]}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
