import { AppError } from '../utils/AppError.js';
import { formatColones, fromCents, toCents } from '../utils/money.js';
import { calculateDiscount } from './pricing.js';
import * as couponsRepository from '../repositories/coupons.repository.js';

/**
 * Busca un cupón y verifica todas sus reglas. Lanza AppError si no se puede usar.
 * Dentro de withTransaction, la lectura y la escritura posterior son atómicas.
 */
export function getUsableCoupon(code, { subtotalCents, customerId }) {
  const coupon = couponsRepository.findByCode(code);
  if (!coupon) {
    throw AppError.notFound(`El cupón ${code} no existe`);
  }
  assertCouponUsable(coupon, { subtotalCents, customerId });
  return coupon;
}

function assertCouponUsable(coupon, { subtotalCents, customerId }) {
  // Las fechas son ISO-8601 en UTC: compararlas como texto es correcto
  const now = new Date().toISOString();

  if (coupon.isActive !== 1) {
    throw AppError.conflict(`El cupón ${coupon.code} está desactivado`);
  }
  if (now < coupon.validFrom) {
    throw AppError.conflict(`El cupón ${coupon.code} todavía no está vigente`);
  }
  if (now > coupon.validUntil) {
    throw AppError.conflict(`El cupón ${coupon.code} está vencido`);
  }
  if (coupon.maxUses !== null && coupon.timesUsed >= coupon.maxUses) {
    throw AppError.conflict(`El cupón ${coupon.code} ya no tiene usos disponibles`);
  }
  if (customerId && couponsRepository.hasActiveUseByCustomer(coupon.id, customerId)) {
    throw AppError.conflict(`Ya usaste el cupón ${coupon.code}`);
  }
  if (subtotalCents < coupon.minSubtotalCents) {
    throw AppError.badRequest(`El cupón ${coupon.code} requiere una compra mínima de ${formatColones(coupon.minSubtotalCents)}`,
    );
  }
}

// Consulta de un cupón sin comprar (frontend y agente de n8n).
export function validate(code, { subtotal }, user) {
  const subtotalCents = toCents(subtotal);
  const coupon = getUsableCoupon(code, { subtotalCents, customerId: user?.customerId ?? null });

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountType === 'PERCENT' ? coupon.discountPercent : fromCents(coupon.discountAmountCents),
    minSubtotal: fromCents(coupon.minSubtotalCents),
    validUntil: coupon.validUntil,
    discount: fromCents(calculateDiscount(subtotalCents, coupon)),
  };
}
