import { withTransaction } from '../db.js';
import { AppError } from '../utils/AppError.js';
import { fromCents } from '../utils/money.js';
import * as couponsRepository from '../repositories/coupons.repository.js';
import * as couponsService from './coupons.service.js';
import * as customersRepository from '../repositories/customers.repository.js';
import * as productsRepository from '../repositories/products.repository.js';
import * as shippingRepository from '../repositories/shipping.repository.js';
import { calculateSubtotalCents, calculateTotals } from './pricing.js';
import * as ordersRepository from '../repositories/orders.repository.js';

const CANCELLABLE_STATUSES = ['PENDING', 'PAID'];

// Flujo de estados permitido: PENDING → PAID → SHIPPED → DELIVERED
// (el trigger trg_orders_status_transition aplica la misma regla en la BD)
const NEXT_STATUS = { PENDING: 'PAID', PAID: 'SHIPPED', SHIPPED: 'DELIVERED' };

// ── Permisos ──────────────────────────────────────────────────────────

// Un CUSTOMER siempre compra para sí mismo, aunque envíe otro customerId.
function resolveCustomerId(user, requestedCustomerId) {
  if (user.role === 'CUSTOMER') return user.customerId;
  if (!requestedCustomerId) {
    throw AppError.badRequest('Indica para qué cliente es la orden');
  }
  return requestedCustomerId;
}

const canAccess = (user, order) => user.role === 'ADMIN' || order.customerId === user.customerId;

// 404 (no 403) para no revelar que existe una orden de otra persona.
function findAccessibleOrder(id, user) {
  const order = ordersRepository.findById(id);
  if (!order || !canAccess(user, order)) {
    throw AppError.notFound(`La orden ${id} no existe`);
  }
  return order;
}

// ── Consultas ─────────────────────────────────────────────────────────

export function list(filters, user) {
  const customerId = user.role === 'CUSTOMER' ? user.customerId : filters.customerId;
  return ordersRepository.findAll({ ...filters, customerId });
}

export function getById(id, user) {
  const order = findAccessibleOrder(id, user);
  return { ...order, items: ordersRepository.findItemsByOrderId(id) };
}

// Cotización: mismas validaciones y cálculos que crear la orden, sin escribir nada.
export function quote(input, user) {
  const { coupon, lines, totals } = prepareOrder({ ...input, customerId: resolveCustomerId(user, input.customerId) });
  return {
    couponCode: coupon?.code ?? null,
    items: lines.map(({ productId, sku, name, quantity, unitPriceCents }) => ({
      productId,
      sku,
      name,
      quantity,
      unitPrice: fromCents(unitPriceCents),
      lineTotal: fromCents(unitPriceCents * quantity),
    })),
    ...toMoney(totals),
  };
}

// ── Transacciones ─────────────────────────────────────────────────────

/**
 * TRANSACCIÓN 1 · Crear orden.
 * Validar stock y cupón, insertar orden e items, descontar stock, registrar
 * movimientos y sumar el uso del cupón: todo o nada.
 */
export function create(input, user) {
  const customerId = resolveCustomerId(user, input.customerId);

  const orderId = withTransaction(() => {
    const { coupon, lines, totals } = prepareOrder({ ...input, customerId });

    const newOrderId = ordersRepository.insertOrder({
      customerId,
      shippingZoneId: input.shippingZoneId,
      couponId: coupon?.id ?? null,
      subtotalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
    });

    for (const line of lines) {
      ordersRepository.insertItem({
        orderId: newOrderId,
        productId: line.productId,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
      });
      productsRepository.changeStock(line.productId, -line.quantity);
      productsRepository.insertStockMovement({
        productId: line.productId,
        orderId: newOrderId,
        quantityChange: -line.quantity,
        reason: 'SALE',
      });
    }

    if (coupon) couponsRepository.incrementUsage(coupon.id);
    return newOrderId;
  });

  return getById(orderId, user);
}

/**
 * TRANSACCIÓN 2 · Cancelar orden.
 * Devolver stock, registrar movimientos, liberar el cupón y marcar CANCELLED: todo o nada.
 */
export function cancel(id, reason, user) {
  withTransaction(() => {
    const order = findAccessibleOrder(id, user);
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw AppError.conflict(`No se puede cancelar una orden en estado ${order.status}`);
    }

    for (const item of ordersRepository.findItemsByOrderId(id)) {
      productsRepository.changeStock(item.productId, item.quantity);
      productsRepository.insertStockMovement({
        productId: item.productId,
        orderId: id,
        quantityChange: item.quantity,
        reason: 'CANCELLATION',
      });
    }

    if (order.couponId) couponsRepository.decrementUsage(order.couponId);
    ordersRepository.markCancelled(id, reason);
  });

  return getById(id, user);
}

// Avanza el estado un paso (solo ADMIN, lo exige la ruta).
export function updateStatus(id, status, user) {
  const order = findAccessibleOrder(id, user);
  if (NEXT_STATUS[order.status] !== status) {
    throw AppError.conflict(`No se puede pasar de ${order.status} a ${status}`);
  }
  if (!ordersRepository.updateStatus(id, order.status, status)) {
    throw AppError.conflict('La orden fue modificada por otra operación; recarga e intenta de nuevo');
  }
  return getById(id, user);
}

// ── Preparación y cálculo ─────────────────────────────────────────────

/** Valida cliente, zona, productos, stock y cupón, y calcula los montos en céntimos. */
function prepareOrder(input) {
  if (!customersRepository.findById(input.customerId)) {
    throw AppError.notFound(`El cliente ${input.customerId} no existe`);
  }

  const zone = shippingRepository.findZoneById(input.shippingZoneId);
  if (!zone) {
    throw AppError.notFound(`La zona de envío ${input.shippingZoneId} no existe`);
  }

  const products = productsRepository.findByIds(input.items.map((item) => item.productId));
  const lines = buildLines(input.items, new Map(products.map((product) => [product.id, product])));

  const coupon = input.couponCode
    ? couponsService.getUsableCoupon(input.couponCode, {
        subtotalCents: calculateSubtotalCents(lines),
        customerId: input.customerId,
      })
    : null;

  return { coupon, lines, totals: calculateTotals({ lines, zone, coupon }) };
}

function buildLines(items, productsById) {
  const missingIds = items.filter((item) => !productsById.has(item.productId)).map((item) => item.productId);
  if (missingIds.length > 0) {
    throw AppError.notFound('Uno o más productos no existen', { productIds: missingIds });
  }

  const inactiveIds = items.filter((item) => !productsById.get(item.productId).isActive).map((item) => item.productId);
  if (inactiveIds.length > 0) {
    throw AppError.conflict('Uno o más productos ya no están a la venta', { productIds: inactiveIds });
  }

  const outOfStock = items
    .map((item) => ({ item, product: productsById.get(item.productId) }))
    .filter(({ item, product }) => product.stock < item.quantity)
    .map(({ item, product }) => ({
      productId: product.id,
      name: product.name,
      requested: item.quantity,
      available: product.stock,
    }));
  if (outOfStock.length > 0) {
    throw AppError.conflict('Stock insuficiente para uno o más productos', outOfStock);
  }

  return items.map((item) => {
    const product = productsById.get(item.productId);
    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      weightGrams: product.weightGrams,
    };
  });
}

const toMoney = (totals) => ({
  subtotal: fromCents(totals.subtotalCents),
  discount: fromCents(totals.discountCents),
  shippingCost: fromCents(totals.shippingCents),
  total: fromCents(totals.totalCents),
  totalWeightKg: totals.totalWeightGrams / 1000,
});
