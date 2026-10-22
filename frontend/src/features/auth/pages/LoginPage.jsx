import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { STORE } from '../../../config/env.js';
import { Logo } from '../../../shared/index.js';
import { AuthForm } from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const MODES = [
  { id: 'login', label: 'Ingresar' },
  { id: 'register', label: 'Crear cuenta' },
];

const COPY = {
  login: { title: 'Hola de nuevo', text: 'Ingresa para comprar, seguir tus órdenes y hablar con el asistente.' },
  register: { title: 'Crea tu cuenta', text: 'Solo necesitas tu nombre, un email y una contraseña.' },
};

export function LoginPage() {
  const { status, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from ?? '/';

  if (status === 'authenticated') return <Navigate to={returnTo} replace />;

  async function handleSubmit(payload) {
    await (mode === 'login' ? login(payload) : register(payload));
    navigate(returnTo, { replace: true });
  }

  const activeIndex = MODES.findIndex((option) => option.id === mode);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(28rem,36rem)]">
      {/* Panel de marca: solo en pantallas grandes */}
      <aside className="relative hidden overflow-hidden bg-ink text-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="w-fit">
          <Logo animated inverted />
        </Link>
        <div className="animate-rise max-w-md">
          <p className="font-display text-5xl leading-[1.05] font-semibold tracking-tight">
            Tecnología que funciona, sin complicaciones.
          </p>
          <p className="mt-6 text-card/60">
            {STORE.tagline} con envío a todo el país. {STORE.city}.
          </p>
        </div>
        <p className="font-mono text-xs text-card/40">Precios en colones · impuestos incluidos</p>
        {/* Trazo decorativo: una pista de circuito que cruza el panel */}
        <svg
          className="pointer-events-none absolute -right-24 bottom-24 w-136 text-card/10"
          viewBox="0 0 400 200"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 160H140L190 110H320L360 70H400"
            pathLength="1"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-draw [stroke-dasharray:1]"
            style={{ animationDuration: '1600ms' }}
          />
          <circle cx="190" cy="110" r="5" fill="currentColor" />
          <circle cx="320" cy="110" r="5" className="fill-accent" />
        </svg>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-10 inline-block lg:hidden">
            <Logo animated size="md" />
          </Link>

          <div key={mode} className="animate-page-in">
            <h1 className="font-display text-4xl font-semibold tracking-tight">{COPY[mode].title}</h1>
            <p className="mt-3 text-ink-soft">{COPY[mode].text}</p>
          </div>

          <div role="tablist" aria-label="Tipo de acceso" className="relative mt-8 mb-8 grid grid-cols-2 border-b border-line">
            {MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={mode === option.id}
                onClick={() => setMode(option.id)}
                className={`pb-3 text-sm transition-colors ${mode === option.id ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                {option.label}
              </button>
            ))}
            {/* Subrayado que se desliza hacia la pestaña activa */}
            <span
              aria-hidden="true"
              className="absolute -bottom-px left-0 h-0.5 w-1/2 bg-accent transition-transform duration-300 ease-out-soft"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
          </div>

          <AuthForm key={mode} mode={mode} onSubmit={handleSubmit} />

          <p className="mt-10 text-center text-xs text-muted">
            <Link to="/" className="underline decoration-line underline-offset-4 hover:text-ink">
              Seguir viendo el catálogo sin ingresar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
