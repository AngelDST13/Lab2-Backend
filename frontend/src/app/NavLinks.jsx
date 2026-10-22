import { NavLink } from 'react-router';
import { useAuth } from '../features/auth/index.js';

const linkClass = ({ isActive }) =>
  `relative py-1 text-sm transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-out-soft ${
    isActive ? 'text-ink after:scale-x-100' : 'text-ink-soft after:scale-x-0 hover:text-ink hover:after:scale-x-100'
  }`;

// Los enlaces dependen del rol, pero ocultar un enlace no es seguridad:
// la API vuelve a validar el rol en cada petición.
export function NavLinks({ itemCount, stacked = false }) {
  const { status, isAdmin } = useAuth();
  const signedIn = status === 'authenticated';

  return (
    <>
      <NavLink to="/" end className={linkClass}>
        Catálogo
      </NavLink>
      {signedIn && (
        <NavLink to="/ordenes" className={linkClass}>
          {isAdmin ? 'Órdenes' : 'Mis órdenes'}
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/inventario" className={linkClass}>
          Inventario
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/resumen" className={linkClass}>
          Resumen
        </NavLink>
      )}
      {signedIn && (
        <NavLink to="/ayuda" className={linkClass}>
          Ayuda
        </NavLink>
      )}
      {!stacked && (
        <NavLink to="/carrito" className={linkClass}>
          Carrito{' '}
          <span key={itemCount} className="inline-block animate-bump font-mono tabular">
            ({itemCount})
          </span>
        </NavLink>
      )}
    </>
  );
}
