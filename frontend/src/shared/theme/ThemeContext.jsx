import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

const STORAGE_KEY = 'circuito:theme';
const THEME_COLORS = { light: '#f5f2eb', dark: '#141311' };
const ThemeContext = createContext(null);

// El script de index.html ya fijó data-theme antes de pintar; aquí solo se lee.
const readInitialTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sin almacenamiento el tema dura solo esta visita
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  /**
   * Cambia de tema. Si el navegador soporta View Transitions, el tema nuevo
   * se revela en un círculo que crece desde `origin` (el punto donde se hizo clic).
   */
  const toggleTheme = useCallback(
    (origin) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      const commit = () => {
        applyTheme(next);
        setTheme(next);
      };

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || reducedMotion) {
        commit();
        return;
      }

      const root = document.documentElement;
      root.style.setProperty('--theme-x', origin ? `${origin.x}px` : '50%');
      root.style.setProperty('--theme-y', origin ? `${origin.y}px` : '0%');
      // flushSync: React debe pintar el tema nuevo dentro de la captura de la transición
      document.startViewTransition(() => flushSync(commit));
    },
    [theme],
  );

  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return context;
}
