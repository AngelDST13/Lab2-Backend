import { formatMoney } from '../utils/format.js';

function Row({ label, children, className = '' }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${className}`}>
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-mono tabular">{children}</dd>
    </div>
  );
}

export function TotalsSummary({ subtotal, discount, shippingCost, total, couponCode }) {
  return (
    <dl className="text-sm">
      <Row label="Subtotal">{formatMoney(subtotal)}</Row>
      {discount > 0 && (
        <Row label={`Descuento ${couponCode ?? ''}`} className="text-ok">
          −{formatMoney(discount)}
        </Row>
      )}
      <Row label="Envío">{shippingCost === 0 ? 'Gratis' : formatMoney(shippingCost)}</Row>
      <div className="mt-2 flex items-baseline justify-between border-t border-ink pt-3">
        <dt className="font-display text-lg font-semibold">Total</dt>
        <dd className="font-mono text-lg font-medium tabular">{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}
