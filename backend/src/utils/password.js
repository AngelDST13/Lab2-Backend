import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// scrypt viene en Node: es un hash lento a propósito (resistente a fuerza bruta)
// y cada contraseña lleva su propia sal aleatoria.
const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const COST = { N: 16384, r: 8, p: 1 };

/** Devuelve "scrypt$N$r$p$sal$hash" (todo lo necesario para verificar después). */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH, COST);
  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, N, r, p, saltBase64, hashBase64] = storedHash.split('$');
  if (algorithm !== 'scrypt') return false;

  const expected = Buffer.from(hashBase64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltBase64, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  // Comparación en tiempo constante: no revela cuántos bytes coinciden
  return timingSafeEqual(actual, expected);
}
