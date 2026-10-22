import { z } from 'zod';

// Carga backend/.env desde el código y no con el flag --env-file: en Windows, ese flag
// hace que `node --watch` vigile la carpeta del .env y reinicie el servidor con cada
// escritura de SQLite en data/. Las variables que ya existan en el sistema no se pisan.
try {
  process.loadEnvFile();
} catch (err) {
  if (err.code !== 'ENOENT') throw err; // sin .env: variables del sistema y valores por defecto
}

// Si falta una variable crítica, el servidor no arranca.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_PATH: z.string().min(1).default('./data/circuito.db'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().max(24 * 30).default(24 * 7),
  N8N_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  // Token con el que las herramientas del agente de n8n consultan la API
  AGENT_SERVICE_TOKEN: z.string().min(32).optional().or(z.literal('')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
