import { db } from '../db.js';

// Métricas calculadas por SQLite con funciones de agregación (COUNT, SUM, AVG) y GROUP BY.
// Los montos se guardan en céntimos: "/ 100.0" los convierte a colones en la propia consulta.
// Las órdenes CANCELLED no cuentan como venta.

export function getSalesTotals() {
  return db
    .prepare(
      `SELECT COUNT(*)                            AS orders,
              COALESCE(SUM(total_cents), 0) / 100.0    AS revenue,
              COALESCE(AVG(total_cents), 0) / 100.0    AS averageTicket,
              COALESCE(SUM(discount_cents), 0) / 100.0 AS discounts,
              COALESCE(SUM(shipping_cents), 0) / 100.0 AS shipping
         FROM orders
        WHERE status <> 'CANCELLED'`,
    )
    .get();
}

export function getOrdersByStatus() {
  return db
    .prepare(
      `SELECT status,
              COUNT(*)                AS orders,
              SUM(total_cents) / 100.0 AS total
         FROM orders
        GROUP BY status
        ORDER BY orders DESC`,
    )
    .all();
}

export function getTopProducts(limit) {
  return db
    .prepare(
      `SELECT p.id, p.sku, p.name,
              SUM(oi.quantity)                AS unitsSold,
              SUM(oi.line_total_cents) / 100.0 AS revenue
         FROM order_items oi
         JOIN orders   o ON o.id = oi.order_id
         JOIN products p ON p.id = oi.product_id
        WHERE o.status <> 'CANCELLED'
        GROUP BY p.id
        ORDER BY unitsSold DESC, revenue DESC
        LIMIT ?`,
    )
    .all(limit);
}

export function getTopCustomers(limit) {
  return db
    .prepare(
      `SELECT c.id, c.full_name AS name,
              COUNT(o.id)               AS orders,
              SUM(o.total_cents) / 100.0 AS spent
         FROM customers c
         JOIN orders    o ON o.customer_id = c.id AND o.status <> 'CANCELLED'
        GROUP BY c.id
        ORDER BY spent DESC
        LIMIT ?`,
    )
    .all(limit);
}

// LEFT JOIN: las zonas sin ventas también aparecen, con 0
export function getSalesByZone() {
  return db
    .prepare(
      `SELECT z.name                                  AS zone,
              COUNT(o.id)                             AS orders,
              COALESCE(SUM(o.total_cents), 0) / 100.0    AS revenue,
              COALESCE(SUM(o.shipping_cents), 0) / 100.0 AS shipping
         FROM shipping_zones z
         LEFT JOIN orders o ON o.shipping_zone_id = z.id AND o.status <> 'CANCELLED'
        GROUP BY z.id
        ORDER BY revenue DESC`,
    )
    .all();
}

export function getCouponUsage() {
  return db
    .prepare(
      `SELECT c.code,
              c.times_used                               AS timesUsed,
              c.max_uses                                 AS maxUses,
              COUNT(o.id)                                AS activeOrders,
              COALESCE(SUM(o.discount_cents), 0) / 100.0 AS totalDiscount
         FROM coupons c
         LEFT JOIN orders o ON o.coupon_id = c.id AND o.status <> 'CANCELLED'
        GROUP BY c.id
        ORDER BY totalDiscount DESC, c.code`,
    )
    .all();
}

export function getInventory(lowStockThreshold) {
  return db
    .prepare(
      `SELECT COUNT(*)                                            AS products,
              COALESCE(SUM(stock), 0)                             AS units,
              COALESCE(SUM(stock * price_cents), 0) / 100.0       AS stockValue,
              SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END)          AS outOfStock,
              SUM(CASE WHEN stock BETWEEN 1 AND ? THEN 1 ELSE 0 END) AS lowStock
         FROM products
        WHERE is_active = 1`,
    )
    .get(lowStockThreshold);
}

// substr(created_at, 1, 10) = 'YYYY-MM-DD' (las fechas se guardan en ISO-8601)
export function getDailySales(days) {
  return db
    .prepare(
      `SELECT substr(created_at, 1, 10)  AS day,
              COUNT(*)                   AS orders,
              SUM(total_cents) / 100.0   AS revenue
         FROM orders
        WHERE status <> 'CANCELLED'
          AND created_at >= strftime('%Y-%m-%dT00:00:00.000Z', 'now', ?)
        GROUP BY day
        ORDER BY day`,
    )
    .all(`-${days - 1} days`);
}
