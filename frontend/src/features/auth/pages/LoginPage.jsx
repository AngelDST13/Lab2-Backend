import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { STORE } from '../../../config/env.js';
import { Logo, ThemeToggle } from '../../../shared/index.js';
import { AuthForm } from '../components/AuthForm.jsx';
import { BrandSlider } from '../components/BrandSlider.jsx';
import { SkyDecor } from '../components/SkyDecor.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SUCCESS_PAUSE_MS = 650;

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
  // Distingue "ya tenía sesión al llegar" (redirigir de inmediato) de "acaba de ingresar" (mostrar el check)
  const submittedHere = useRef(false);

  if (status === 'authenticated' && !submittedHere.current) return <Navigate to={returnTo} replace />;

  async function handleSubmit(payload) {
    submittedHere.current = true;
    try {
      await (mode === 'login' ? login(payload) : register(payload));
    } catch (error) {
      submittedHere.current = false;
      throw error;
    }
    // Una pausa breve para que se vea el check de "listo" antes de entrar
    setTimeout(() => navigate(returnTo, { replace: true }), SUCCESS_PAUSE_MS);
  }

  const activeIndex = MODES.findIndex((option) => option.id === mode);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(28rem,36rem)]">
      {/* Panel de marca: tinta de día, cielo nocturno de noche */}
      <aside className="relative hidden overflow-hidden bg-ink text-card transition-colors duration-700 lg:flex lg:flex-col lg:justify-between lg:p-12 dark:bg-card dark:text-ink">
        <SkyDecor />
        <Link to="/" className="relative w-fit">
          <Logo animated inheritColor />
        </Link>
        <div className="relative">
          <BrandSlider />
        </div>
        <p className="relative font-mono text-xs opacity-40">
          {STORE.city} · precios en colones, impuestos incluidos
        </p>
      </aside>

      <main className="relative flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-10 inline-block lg:hidden">
            <Logo animated />
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
