import { withTransaction } from '../db.js';
import { AppError } from '../utils/AppError.js';
import { toCents } from '../utils/money.js';
import * as productsRepository from '../repositories/products.repository.js';

const toGrams = (kg) => Math.round(kg * 1000);

export function list(filters) {
  return productsRepository.findAll(filters);
}

export function getById(id) {
  const product = productsRepository.findById(id);
  if (!product) {
    throw AppError.notFound(`El producto ${id} no existe`);
  }
  return product;
}

// Producto + movimiento de stock inicial: o se guardan los dos, o ninguno.
export function create({ sku, name, price, stock, weightKg }) {
  return withTransaction(() => {
    const product = productsRepository.create({
      sku,
      name,
      priceCents: toCents(price),
      stock,
      weightGrams: toGrams(weightKg),
    });
    if (product.stock > 0) {
      productsRepository.insertStockMovement({ productId: product.id, quantityChange: product.stock, reason: 'RESTOCK' });
    }
    return product;
  });
}

export function update(id, fields) {
  const changes = {
    ...(fields.sku !== undefined && { sku: fields.sku }),
    ...(fields.name !== undefined && { name: fields.name }),
    ...(fields.price !== undefined && { priceCents: toCents(fields.price) }),
    ...(fields.weightKg !== undefined && { weightGrams: toGrams(fields.weightKg) }),
    ...(fields.isActive !== undefined && { isActive: Number(fields.isActive) }),
  };

  const product = productsRepository.update(id, changes);
  if (!product) {
    throw AppError.notFound(`El producto ${id} no existe`);
  }
  return product;
}

// Reposición: suma stock y registra el movimiento RESTOCK en la misma transacción.
export function restock(id, quantity) {
  withTransaction(() => {
    if (!productsRepository.changeStock(id, quantity)) {
      throw AppError.notFound(`El producto ${id} no existe`);
    }
    productsRepository.insertStockMovement({ productId: id, quantityChange: quantity, reason: 'RESTOCK' });
  });
  return getById(id);
}

/**
 * Un producto que ya se vendió no se borra: las órdenes lo necesitan para su historial.
 * En ese caso se responde 409 y lo correcto es desactivarlo (PATCH isActive: false).
 * Si nunca se vendió, se borran sus movimientos de reposición y el producto, en una transacción.
 */
export function remove(id) {
  return withTransaction(() => {
    const product = getById(id);
    if (productsRepository.hasSales(id)) {
      throw AppError.conflict(`${product.name} tiene ventas registradas; desactívalo en lugar de borrarlo`);
    }
    productsRepository.remove(id);
    return { id, sku: product.sku, deleted: true };
  });
}

export function listMovements(id) {
  getById(id);
  return productsRepository.findMovements(id);
}
