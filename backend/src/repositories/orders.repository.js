import { db } from '../db.js';

const ORDER_COLUMNS = `
  o.id, o.status,
  o.subtotal_cents / 100.0 AS subtotal,
  o.discount_cents / 100.0 AS discount,
  o.shipping_cents / 100.0 AS shippingCost,
  o.total_cents / 100.0    AS total,
  o.created_at       AS createdAt,
  o.cancelled_at     AS cancelledAt,
  o.cancel_reason    AS cancelReason,
  o.customer_id      AS customerId,
  c.full_name        AS customerName,
  c.email            AS customerEmail,
  o.shipping_zone_id AS shippingZoneId,
  z.name             AS shippingZoneName,
  o.coupon_id        AS couponId,
  cp.code            AS couponCode`;

const ORDER_FROM = `
  FROM orders o
  JOIN customers      c  ON c.id  = o.customer_id
  JOIN shipping_zones z  ON z.id  = o.shipping_zone_id
  LEFT JOIN coupons   cp ON cp.id = o.coupon_id`;

export function findAll({ customerId, status }) {
  return db
    .prepare(
      `SELECT ${ORDER_COLUMNS},
              (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS itemCount
         ${ORDER_FROM}
        WHERE (@customerId IS NULL OR o.customer_id = @customerId)
          AND (@status IS NULL OR o.status = @status)
        ORDER BY o.created_at DESC, o.id DESC
        LIMIT 100`,
    )
    .all({ customerId: customerId ?? null, status: status ?? null });
}

export function findById(id) {
  return db.prepare(`SELECT ${ORDER_COLUMNS} ${ORDER_FROM} WHERE o.id = ?`).get(id) ?? null;
}

export function findItemsByOrderId(orderId) {
  return db
    .prepare(
      `SELECT oi.id,
              oi.product_id               AS productId,
              p.sku, p.name,
              oi.quantity,
              oi.unit_price_cents / 100.0 AS unitPrice,
              oi.line_total_cents / 100.0 AS lineTotal
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.product_id`,
    )
    .all(orderId);
}

export function insertOrder(order) {
  return db
    .prepare(
      `INSERT INTO orders (customer_id, shipping_zone_id, coupon_id, subtotal_cents, discount_cents, shipping_cents, total_cents)
       VALUES (@customerId, @shippingZoneId, @couponId, @subtotalCents, @discountCents, @shippingCents, @totalCents)
       RETURNING id`,
    )
    .get(order).id;
}

export function insertItem({ orderId, productId, quantity, unitPriceCents }) {
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)').run(
    orderId,
    productId,
    quantity,
    unitPriceCents,
  );
}

export function markCancelled(id, reason) {
  db.prepare(
    `UPDATE orders
        SET status = 'CANCELLED',
            cancelled_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            cancel_reason = ?
      WHERE id = ?`,
  ).run(reason, id);
}

// Actualización condicional: solo cambia si la orden sigue en el estado esperado.
export function updateStatus(id, fromStatus, toStatus) {
  return db.prepare('UPDATE orders SET status = ? WHERE id = ? AND status = ?').run(toStatus, id, fromStatus).changes === 1;
}
