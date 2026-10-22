import { env } from './config/env.js';
import { createApp } from './app.js';
import { db } from './db.js';
import { purgeExpiredSessions } from './services/auth.service.js';

const SESSION_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

const app = createApp();

// En Express 5 los errores de arranque (ej. puerto ocupado) llegan como argumento del callback.
const server = app.listen(env.PORT, (err) => {
  if (err) {
    console.error(`No se pudo iniciar la API en el puerto ${env.PORT}: ${err.message}`);
    process.exit(1);
  }
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});

// Limpieza periódica de sesiones vencidas (unref: no impide que el proceso termine)
purgeExpiredSessions();
setInterval(purgeExpiredSessions, SESSION_CLEANUP_INTERVAL_MS).unref();

// Cierre ordenado: deja de aceptar peticiones y cierra el archivo de la BD.
function shutdown(signal) {
  console.log(`${signal} recibido, cerrando el servidor...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
