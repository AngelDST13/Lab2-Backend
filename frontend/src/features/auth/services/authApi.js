import { apiRequest } from '../../../services/apiClient.js';

// La sesión viaja en una cookie httpOnly: el frontend nunca ve ni guarda el token.

export const getCurrentUser = (signal) => apiRequest('/api/auth/me', { signal });

export const login = (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: credentials });

export const register = (account) => apiRequest('/api/auth/register', { method: 'POST', body: account });

export const logout = () => apiRequest('/api/auth/logout', { method: 'POST' });
