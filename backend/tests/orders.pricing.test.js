import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateDiscount, calculateShipping, calculateTotals } from '../src/services/pricing.js';

// Todo en céntimos y gramos, igual que en la BD
const metroZone = { baseCostCents: 250_000, costPerKgCents: 50_000, freeShippingFromCents: 5_000_000 };
const coastZone = { baseCostCents: 500_000, costPerKgCents: 100_000, freeShippingFromCents: null };
const percent10 = { discountType: 'PERCENT', discountPercent: 10, discountAmountCents: null };
const fixed5000 = { discountType: 'FIXED', discountPercent: null, discountAmountCents: 500_000 };

describe('calculateDiscount', () => {
  it('sin cupón no hay descuento', () => {
    assert.equal(calculateDiscount(3_000_000, null), 0);
  });

  it('PERCENT aplica el porcentaje sobre el subtotal', () => {
    assert.equal(calculateDiscount(3_000_000, percent10), 300_000);
  });

  it('FIXED nunca supera el subtotal', () => {
    assert.equal(calculateDiscount(250_000, fixed5000), 250_000);
  });
});

describe('calculateShipping', () => {
  it('cobra base + costo por kg', () => {
    const cents = calculateShipping({ zone: metroZone, totalWeightGrams: 600, amountAfterDiscountCents: 3_000_000 });
    assert.equal(cents, 280_000); // 2500 + 500 × 0,6 = ₡2 800
  });

  it('es gratis al alcanzar el mínimo de la zona', () => {
    const cents = calculateShipping({ zone: metroZone, totalWeightGrams: 4500, amountAfterDiscountCents: 5_000_000 });
    assert.equal(cents, 0);
  });

  it('una zona sin mínimo nunca es gratis', () => {
    const cents = calculateShipping({ zone: coastZone, totalWeightGrams: 1000, amountAfterDiscountCents: 99_999_999 });
    assert.equal(cents, 600_000);
  });
});

describe('calculateTotals', () => {
  it('reproduce la orden de ejemplo de schema.sql', () => {
    const lines = [{ unitPriceCents: 1_500_000, quantity: 2, weightGrams: 300 }];
    assert.deepEqual(calculateTotals({ lines, zone: metroZone }), {
      subtotalCents: 3_000_000,
      discountCents: 0,
      shippingCents: 280_000,
      totalCents: 3_280_000,
      totalWeightGrams: 600,
    });
  });

  it('el envío gratis se evalúa sobre el monto CON descuento', () => {
    // ₡52 000 − 10 % = ₡46 800 < ₡50 000 → sí paga envío
    const lines = [{ unitPriceCents: 2_600_000, quantity: 2, weightGrams: 1000 }];
    const totals = calculateTotals({ lines, zone: metroZone, coupon: percent10 });
    assert.equal(totals.discountCents, 520_000);
    assert.equal(totals.shippingCents, 350_000);
    assert.equal(totals.totalCents, 5_030_000);
  });

  it('el total siempre cumple la regla del CHECK chk_orders_total', () => {
    const lines = [
      { unitPriceCents: 999, quantity: 3, weightGrams: 155 },
      { unitPriceCents: 1, quantity: 7, weightGrams: 1 },
    ];
    const totals = calculateTotals({ lines, zone: coastZone, coupon: percent10 });
    assert.equal(totals.totalCents, totals.subtotalCents - totals.discountCents + totals.shippingCents);
    assert.ok(Number.isInteger(totals.totalCents));
  });
});
