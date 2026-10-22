import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/index.js';

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

export function UserMenu() {
  const { status, user, logout } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();

  if (status === 'loading') return <span className="block h-8 w-24" aria-hidden="true" />;

  if (status === 'anonymous') {
    return (
      <Link
        to="/ingresar"
        className="inline-flex h-9 items-center border border-ink px-4 text-sm transition-colors duration-200 hover:bg-ink hover:text-card"
      >
        Ingresar
      </Link>
    );
  }

  async function handleLogout() {
    setLeaving(true);
    await logout();
    navigate('/');
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="grid size-8 place-items-center bg-ink font-mono text-xs text-card"
        aria-hidden="true"
        title={user.displayName}
      >
        {initialsOf(user.displayName)}
      </span>
      <div className="leading-tight">
        <p className="text-sm">{user.displayName.split(' ')[0]}</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={leaving}
          className="text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-danger"
        >
          {leaving ? 'Saliendo…' : 'Salir'}
        </button>
      </div>
    </div>
  );
}
