import { db } from '../db.js';

// La BD guarda céntimos y gramos; la API expone colones y kg (y conserva los enteros
// para que los services calculen sin decimales).
const PRODUCT_COLUMNS = `
  id, sku, name,
  price_cents / 100.0   AS price,
  price_cents           AS priceCents,
  stock,
  weight_grams / 1000.0 AS weightKg,
  weight_grams          AS weightGrams,
  is_active             AS isActive,
  created_at            AS createdAt`;

// Nombre en el service → columna. Solo estas columnas se pueden actualizar.
const UPDATABLE_COLUMNS = {
  sku: 'sku',
  name: 'name',
  priceCents: 'price_cents',
  weightGrams: 'weight_grams',
  isActive: 'is_active',
};

// SQLite no tiene BOOLEAN: convierte 0/1 a false/true para la API.
const toProduct = (row) => (row ? { ...row, isActive: row.isActive === 1 } : null);

export function findAll({ search, active }) {
  const rows = db
    .prepare(
      `SELECT ${PRODUCT_COLUMNS}
         FROM products
        WHERE (@search IS NULL OR name LIKE '%' || @search || '%' OR sku LIKE '%' || @search || '%')
          AND (@active IS NULL OR is_active = @active)
        ORDER BY name
        LIMIT 200`,
    )
    .all({ search: search ?? null, active: active === undefined ? null : Number(active) });
  return rows.map(toProduct);
}

export function findById(id) {
  return toProduct(db.prepare(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`).get(id));
}

// json_each convierte el arreglo de ids en filas: equivale a "WHERE id IN (...)" con parámetros.
export function findByIds(ids) {
  return db
    .prepare(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id IN (SELECT value FROM json_each(?)) ORDER BY id`)
    .all(JSON.stringify(ids))
    .map(toProduct);
}

export function create({ sku, name, priceCents, stock, weightGrams }) {
  return toProduct(
    db
      .prepare(
        `INSERT INTO products (sku, name, price_cents, stock, weight_grams)
         VALUES (?, ?, ?, ?, ?)
         RETURNING ${PRODUCT_COLUMNS}`,
      )
      .get(sku, name, priceCents, stock, weightGrams),
  );
}

export function update(id, fields) {
  const entries = Object.entries(fields).filter(([key]) => key in UPDATABLE_COLUMNS);
  const setClause = entries.map(([key]) => `${UPDATABLE_COLUMNS[key]} = @${key}`).join(', ');

  return toProduct(
    db
      .prepare(`UPDATE products SET ${setClause} WHERE id = @id RETURNING ${PRODUCT_COLUMNS}`)
      .get({ ...Object.fromEntries(entries), id }),
  );
}

// delta negativo = venta; positivo = cancelación o reposición.
// Si el stock quedara negativo, el CHECK chk_products_stock lo impide.
export function changeStock(productId, delta) {
  return db.prepare('UPDATE products SET stock = stock + ? WHERE id = ? RETURNING stock').get(delta, productId) ?? null;
}

export function insertStockMovement({ productId, orderId = null, quantityChange, reason }) {
  db.prepare(
    'INSERT INTO stock_movements (product_id, order_id, quantity_change, reason) VALUES (?, ?, ?, ?)',
  ).run(productId, orderId, quantityChange, reason);
}

export function hasSales(productId) {
  return db.prepare('SELECT EXISTS (SELECT 1 FROM order_items WHERE product_id = ?) AS sold').get(productId).sold === 1;
}

// Primero los movimientos (dependen del producto por FK) y después el producto
export function remove(productId) {
  db.prepare('DELETE FROM stock_movements WHERE product_id = ?').run(productId);
  return db.prepare('DELETE FROM products WHERE id = ?').run(productId).changes === 1;
}

export function findMovements(productId) {
  return db
    .prepare(
      `SELECT id,
              order_id        AS orderId,
              quantity_change AS quantityChange,
              reason,
              created_at      AS createdAt
         FROM stock_movements
        WHERE product_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 100`,
    )
    .all(productId);
}
