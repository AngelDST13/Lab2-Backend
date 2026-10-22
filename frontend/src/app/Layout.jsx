import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { STORE } from '../config/env.js';
import { useAuth } from '../features/auth/index.js';
import { useCart } from '../features/cart/index.js';
import { Logo, ThemeToggle } from '../shared/index.js';
import { NavLinks } from './NavLinks.jsx';
import { UserMenu } from './UserMenu.jsx';

function MenuToggle({ open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      className="relative size-10 md:hidden"
    >
      {/* Dos líneas que giran hasta formar una X */}
      <span className={`absolute left-2.5 h-px w-5 bg-ink transition-transform duration-300 ease-out-soft ${open ? 'top-1/2 rotate-45' : 'top-3.75'}`} />
      <span className={`absolute left-2.5 h-px w-5 bg-ink transition-transform duration-300 ease-out-soft ${open ? 'top-1/2 -rotate-45' : 'top-6'}`} />
    </button>
  );
}

export function Layout() {
  const { itemCount } = useCart();
  const { status } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Al navegar se cierra el menú móvil
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <p className="bg-ink px-4 py-2 text-center font-mono text-[11px] text-card/80 sm:text-xs">
        {/*   = espacio que no se parte: el monto nunca queda dividido en dos líneas */}
        Envío gratis en la Zona Metropolitana desde ₡50{' '}000
      </p>

      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 md:gap-8" aria-label="Principal">
          <Link to="/" className="mr-auto" aria-label={`${STORE.name}, inicio`}>
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <NavLinks itemCount={itemCount} />
          </div>
          <ThemeToggle />
          <div className="hidden md:block">
            <UserMenu />
          </div>

          <Link to="/carrito" className="relative font-mono text-sm md:hidden" aria-label={`Carrito, ${itemCount} unidades`}>
            Carrito
            <span key={itemCount} className="ml-1 inline-block animate-bump tabular">({itemCount})</span>
          </Link>
          <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />
        </nav>

        {/* Menú móvil: grid 0fr → 1fr anima la altura sin medirla con JavaScript */}
        <div
          id="mobile-menu"
          className={`grid transition-[grid-template-rows] duration-300 ease-out-soft md:hidden ${menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col items-start gap-4 border-t border-line px-4 py-5">
              <NavLinks itemCount={itemCount} stacked />
              {status !== 'loading' && (
                <div className="w-full border-t border-line pt-4">
                  <UserMenu />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        {/* key = ruta: cada página entra con una transición suave */}
        <div key={location.pathname} className="animate-page-in">
          <Outlet />
        </div>
      </main>

      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-xs text-muted sm:px-6">
          <p className="flex items-center gap-2">
            <span className="font-display text-sm text-ink">{STORE.name}</span> · {STORE.tagline} · {STORE.city}
          </p>
          <p>
            Soporte:{' '}
            <a className="underline underline-offset-4 hover:text-ink" href={`mailto:${STORE.supportEmail}`}>
              {STORE.supportEmail}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
