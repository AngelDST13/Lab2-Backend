// Crea (o reinicia) la base SQLite ejecutando schema.sql: tablas, índices, triggers y datos de prueba.
// Uso: npm run db:init
import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

try {
  process.loadEnvFile();
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

const databasePath = resolve(process.env.DATABASE_PATH ?? './data/circuito.db');
mkdirSync(dirname(databasePath), { recursive: true });

const schemaSql = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
const db = new Database(databasePath);

try {
  db.pragma('foreign_keys = ON');
  db.exec(schemaSql);

  const integrity = db.pragma('integrity_check', { simple: true });
  const foreignKeyErrors = db.pragma('foreign_key_check');
  const counts = ['customers', 'users', 'products', 'coupons', 'orders']
    .map((table) => `${table}: ${db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n}`)
    .join(' · ');

  console.log(`Base de datos lista en ${databasePath}`);
  console.log(`Integridad: ${integrity} · llaves foráneas rotas: ${foreignKeyErrors.length}`);
  console.log(counts);
} catch (err) {
  console.error('No se pudo inicializar la base de datos:', err.message);
  process.exitCode = 1;
} finally {
  db.close();
}
