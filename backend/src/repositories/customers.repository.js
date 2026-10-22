import { db } from '../db.js';

const CUSTOMER_COLUMNS = `id, full_name AS fullName, email, created_at AS createdAt`;

export function findAll() {
  return db.prepare(`SELECT ${CUSTOMER_COLUMNS} FROM customers ORDER BY full_name LIMIT 200`).all();
}

export function findById(id) {
  return db.prepare(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = ?`).get(id) ?? null;
}

export function create({ fullName, email }) {
  return db
    .prepare(`INSERT INTO customers (full_name, email) VALUES (?, ?) RETURNING ${CUSTOMER_COLUMNS}`)
    .get(fullName, email);
}

// COALESCE(?, columna): si el campo no viene (null), conserva el valor actual
export function update(id, { fullName, email }) {
  return (
    db
      .prepare(
        `UPDATE customers
            SET full_name = COALESCE(?, full_name),
                email     = COALESCE(?, email)
          WHERE id = ?
          RETURNING ${CUSTOMER_COLUMNS}`,
      )
      .get(fullName ?? null, email ?? null, id) ?? null
  );
}

// La cuenta de acceso del cliente usa el mismo nombre y email
export function syncUserAccount(customerId, { fullName, email }) {
  db.prepare(
    `UPDATE users
        SET display_name = COALESCE(?, display_name),
            email        = COALESCE(?, email)
      WHERE customer_id = ?`,
  ).run(fullName ?? null, email ?? null, customerId);
}

export function hasOrders(customerId) {
  return db.prepare('SELECT EXISTS (SELECT 1 FROM orders WHERE customer_id = ?) AS has').get(customerId).has === 1;
}

// users y sessions se borran solas por ON DELETE CASCADE
export function remove(customerId) {
  return db.prepare('DELETE FROM customers WHERE id = ?').run(customerId).changes === 1;
}
