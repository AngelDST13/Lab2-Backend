import { isProduction } from '../config/env.js';
import { readCookie } from '../utils/cookies.js';
import { sendSuccess } from '../utils/response.js';
import { SESSION_COOKIE } from '../middlewares/auth.middleware.js';
import * as authService from '../services/auth.service.js';

// httpOnly: JavaScript del navegador no puede leerla (protege contra XSS).
// sameSite lax: no viaja en peticiones POST iniciadas por otros sitios (protege contra CSRF).
// secure: solo por HTTPS en producción.
const cookieOptions = (expiresAt) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  path: '/',
  expires: new Date(expiresAt),
});

export async function login(req, res) {
  const session = await authService.login(req.validated.body);
  res.cookie(SESSION_COOKIE, session.token, cookieOptions(session.expiresAt));
  sendSuccess(res, { user: session.user, expiresAt: session.expiresAt });
}

export async function register(req, res) {
  const session = await authService.register(req.validated.body);
  res.cookie(SESSION_COOKIE, session.token, cookieOptions(session.expiresAt));
  sendSuccess(res, { user: session.user, expiresAt: session.expiresAt }, 201);
}

export function logout(req, res) {
  authService.logout(readCookie(req, SESSION_COOKIE));
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
  sendSuccess(res, { loggedOut: true });
}

export function me(req, res) {
  sendSuccess(res, { user: req.user });
}
