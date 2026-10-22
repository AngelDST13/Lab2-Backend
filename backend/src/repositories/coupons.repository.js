import { db } from '../db.js';

const COUPON_COLUMNS = `
  id, code,
  discount_type         AS discountType,
  discount_percent      AS discountPercent,
  discount_amount_cents AS discountAmountCents,
  min_subtotal_cents    AS minSubtotalCents,
  max_uses              AS maxUses,
  times_used            AS timesUsed,
  valid_from            AS validFrom,
  valid_until           AS validUntil,
  is_active             AS isActive`;

export function findByCode(code) {
  return db.prepare(`SELECT ${COUPON_COLUMNS} FROM coupons WHERE code = ?`).get(code) ?? null;
}

export function hasActiveUseByCustomer(couponId, customerId) {
  const row = db
    .prepare(
      `SELECT EXISTS (
         SELECT 1 FROM orders WHERE coupon_id = ? AND customer_id = ? AND status <> 'CANCELLED'
       ) AS used`,
    )
    .get(couponId, customerId);
  return row.used === 1;
}

export function incrementUsage(couponId) {
  db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?').run(couponId);
}

export function decrementUsage(couponId) {
  db.prepare('UPDATE coupons SET times_used = times_used - 1 WHERE id = ?').run(couponId);
}
