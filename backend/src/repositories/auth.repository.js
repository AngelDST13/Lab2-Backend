import { db } from '../db.js';

const USER_COLUMNS = `
  u.id, u.email,
  u.display_name AS displayName,
  u.role,
  u.customer_id  AS customerId`;

export function findUserByEmail(email) {
  return (
    db
      .prepare(
        `SELECT ${USER_COLUMNS}, u.password_hash AS passwordHash, u.is_active AS isActive
           FROM users u WHERE u.email = ?`,
      )
      .get(email) ?? null
  );
}

export function findUserById(id) {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = ?`).get(id) ?? null;
}

export function findActiveUserByCustomerId(customerId) {
  return (
    db.prepare(`SELECT ${USER_COLUMNS} FROM users u WHERE u.customer_id = ? AND u.is_active = 1`).get(customerId) ??
    null
  );
}

// Sesión válida = existe, no venció y el usuario sigue activo.
export function findUserBySession(tokenHash, nowIso) {
  return (
    db
      .prepare(
        `SELECT ${USER_COLUMNS}
           FROM sessions s
           JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_active = 1`,
      )
      .get(tokenHash, nowIso) ?? null
  );
}

export function insertUser({ email, displayName, passwordHash, role, customerId }) {
  return db
    .prepare(
      `INSERT INTO users (email, display_name, password_hash, role, customer_id)
       VALUES (?, ?, ?, ?, ?) RETURNING id`,
    )
    .get(email, displayName, passwordHash, role, customerId).id;
}

export function insertSession({ tokenHash, userId, expiresAt }) {
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    tokenHash,
    userId,
    expiresAt,
  );
}

export function deleteSession(tokenHash) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function deleteExpiredSessions(nowIso) {
  return db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso).changes;
}
