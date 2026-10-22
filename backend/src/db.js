import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from './config/env.js';

const databasePath = resolve(env.DATABASE_PATH);
mkdirSync(dirname(databasePath), { recursive: true });

// Si el archivo no existe, better-sqlite3 lo crea vacío
export const db = new Database(databasePath);

// En SQLite las llaves foráneas vienen APAGADAS y el ajuste es por conexión.
db.pragma('foreign_keys = ON');
// WAL: las lecturas no bloquean a la escritura (y viceversa).
db.pragma('journal_mode = WAL');
// Si otro proceso tiene el bloqueo de escritura, esperar hasta 5 s en vez de fallar.
db.pragma('busy_timeout = 5000');

initializeIfEmpty();

/**
 * Primer arranque: si la base no tiene tablas, ejecuta db/schema.sql
 * (tablas, índices, triggers y datos de prueba). Nunca borra una base existente;
 * para reiniciarla a propósito está `npm run db:init`.
 */
function initializeIfEmpty() {
  const { tables } = db
    .prepare("SELECT count(*) AS tables FROM sqlite_master WHERE type = 'table' AND name = 'products'")
    .get();
  if (tables > 0) return;

  const schemaSql = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
  db.exec(schemaSql);
  console.log(`Base de datos creada con datos de prueba en ${databasePath}`);
}

/**
 * Ejecuta `work` en una transacción BEGIN IMMEDIATE.
 *
 * better-sqlite3 es síncrono: `work` no puede usar await, así que ninguna otra
 * petición se ejecuta en medio de la transacción. IMMEDIATE toma el bloqueo de
 * escritura al empezar, por si otro proceso abre el mismo archivo.
 * Si `work` lanza un error → ROLLBACK automático; si termina → COMMIT.
 *
 * @template T
 * @param {() => T} work
 * @returns {T}
 */
export function withTransaction(work) {
  return db.transaction(work).immediate();
}

/**
 * Varias lecturas que deben ver la misma "foto" de los datos (ej. el resumen):
 * dentro de una transacción de lectura, una venta que entre a mitad no las descuadra.
 *
 * @template T
 * @param {() => T} work
 * @returns {T}
 */
export function withSnapshot(work) {
  return db.transaction(work).deferred();
}
