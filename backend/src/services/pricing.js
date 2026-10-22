// Funciones puras: sin base de datos ni HTTP, todo en céntimos y gramos (enteros).
// Por eso se pueden probar con tests unitarios (ver tests/orders.pricing.test.js).

/** @param {{ unitPriceCents: number, quantity: number }[]} lines */
export function calculateSubtotalCents(lines) {
  return lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
}

/** @param {{ weightGrams: number, quantity: number }[]} lines */
export function calculateWeightGrams(lines) {
  return lines.reduce((sum, line) => sum + line.weightGrams * line.quantity, 0);
}

/**
 * PERCENT: porcentaje del subtotal. FIXED: monto fijo, nunca mayor al subtotal.
 * @param {number} subtotalCents
 * @param {{ discountType: 'PERCENT' | 'FIXED', discountPercent: number | null, discountAmountCents: number | null } | null} coupon
 */
export function calculateDiscount(subtotalCents, coupon) {
  if (!coupon) return 0;
  if (coupon.discountType === 'PERCENT') {
    return Math.round((subtotalCents * coupon.discountPercent) / 100);
  }
  return Math.min(coupon.discountAmountCents, subtotalCents);
}

/**
 * Envío = costo base + costo por kg × peso. Gratis si el monto ya con descuento
 * alcanza el mínimo de la zona (si la zona lo ofrece).
 */
export function calculateShipping({ zone, totalWeightGrams, amountAfterDiscountCents }) {
  const hasFreeShipping =
    zone.freeShippingFromCents !== null && amountAfterDiscountCents >= zone.freeShippingFromCents;
  if (hasFreeShipping) return 0;

  return zone.baseCostCents + Math.round((zone.costPerKgCents * totalWeightGrams) / 1000);
}

export function calculateTotals({ lines, zone, coupon = null }) {
  const subtotalCents = calculateSubtotalCents(lines);
  const totalWeightGrams = calculateWeightGrams(lines);
  const discountCents = calculateDiscount(subtotalCents, coupon);
  const shippingCents = calculateShipping({
    zone,
    totalWeightGrams,
    amountAfterDiscountCents: subtotalCents - discountCents,
  });

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents: subtotalCents - discountCents + shippingCents,
    totalWeightGrams,
  };
}
