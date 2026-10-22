import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../services/authApi.js';

const AuthContext = createContext(null);

/**
 * Estado global de la sesión.
 * status: 'loading' (preguntando al servidor) | 'authenticated' | 'anonymous'
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });

  // Al cargar la app se pregunta al servidor si la cookie sigue siendo válida
  useEffect(() => {
    const controller = new AbortController();
    authApi
      .getCurrentUser(controller.signal)
      .then(({ user }) => setState(user ? { status: 'authenticated', user } : { status: 'anonymous', user: null }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'anonymous', user: null });
      });
    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const { user } = await authApi.login(credentials);
    setState({ status: 'authenticated', user });
    return user;
  }, []);

  const register = useCallback(async (account) => {
    const { user } = await authApi.register(account);
    setState({ status: 'authenticated', user });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({ status: 'anonymous', user: null });
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAdmin: state.user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
