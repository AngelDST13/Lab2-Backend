import { Navigate, useLocation } from 'react-router';
import { LoadingState } from '../../../shared/index.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protege una ruta. Es solo experiencia de usuario: quien de verdad protege
 * los datos es la API, que vuelve a validar sesión y rol en cada petición.
 */
export function RequireAuth({ roles, children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Verificando sesión" />;

  if (status === 'anonymous') {
    return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
