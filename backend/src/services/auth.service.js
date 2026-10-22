import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { withTransaction } from '../db.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import * as customersRepository from '../repositories/customers.repository.js';
import * as authRepository from '../repositories/auth.repository.js';

const SESSION_TTL_MS = env.SESSION_TTL_HOURS * 60 * 60 * 1000;

// Hash de relleno: si el email no existe igual se verifica una contraseña,
// así la respuesta tarda lo mismo y no revela qué emails están registrados.
let dummyHashPromise;
const getDummyHash = () => (dummyHashPromise ??= hashPassword(randomBytes(16).toString('hex')));

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const toPublicUser = ({ id, email, displayName, role, customerId }) => ({ id, email, displayName, role, customerId });

function createSession(user) {
  // 32 bytes aleatorios: imposible de adivinar. Al cliente va el token; a la BD, su hash.
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  authRepository.insertSession({ tokenHash: hashToken(token), userId: user.id, expiresAt });
  return { token, expiresAt, user: toPublicUser(user) };
}

export async function login({ email, password }) {
  const user = authRepository.findUserByEmail(email);
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

  // Mismo mensaje para "no existe" y "contraseña incorrecta"
  if (!user || !passwordMatches || user.isActive !== 1) {
    throw new AppError(401, 'Email o contraseña incorrectos');
  }
  return createSession(user);
}

// Registro: cliente + usuario + sesión. El hash (lento y asíncrono) se calcula
// antes de abrir la transacción, que solo contiene escrituras síncronas.
export async function register({ fullName, email, password }) {
  const passwordHash = await hashPassword(password);

  return withTransaction(() => {
    const customer = customersRepository.create({ fullName, email });
    const userId = authRepository.insertUser({
      email,
      displayName: fullName,
      passwordHash,
      role: 'CUSTOMER',
      customerId: customer.id,
    });
    return createSession(authRepository.findUserById(userId));
  });
}

export function getUserFromSessionToken(token) {
  if (!token) return null;
  const user = authRepository.findUserBySession(hashToken(token), new Date().toISOString());
  return user ? toPublicUser(user) : null;
}

export function logout(token) {
  if (token) authRepository.deleteSession(hashToken(token));
}

/**
 * Autenticación de servicio para las herramientas del agente de n8n.
 * El agente actúa "en nombre de" un cliente con exactamente sus mismos permisos.
 * Devuelve null si el token es válido pero no viene cliente (consultas públicas).
 */
export function getUserFromServiceToken(serviceToken, customerIdHeader) {
  const expected = env.AGENT_SERVICE_TOKEN;
  const provided = Buffer.from(serviceToken);
  if (!expected || provided.length !== Buffer.byteLength(expected) || !timingSafeEqual(provided, Buffer.from(expected))) {
    throw new AppError(401, 'Token de servicio inválido');
  }

  const customerId = Number(customerIdHeader);
  if (!Number.isInteger(customerId) || customerId <= 0) return null;

  const user = authRepository.findActiveUserByCustomerId(customerId);
  return user ? { ...toPublicUser(user), via: 'agent' } : null;
}

export function purgeExpiredSessions() {
  return authRepository.deleteExpiredSessions(new Date().toISOString());
}
