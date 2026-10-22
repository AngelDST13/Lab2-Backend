import { useAutoSlider } from '../hooks/useAutoSlider.js';
import { SlideIcon } from './SlideIcon.jsx';

const SLIDE_DURATION_MS = 6000;

const SLIDES = [
  {
    icon: 'chip',
    title: 'Tecnología que funciona, sin complicaciones.',
    text: 'Audífonos, teclados, monitores y accesorios elegidos uno por uno.',
  },
  {
    icon: 'route',
    title: 'Llegamos a todo el país.',
    text: 'Envío gratis en la Zona Metropolitana desde ₡50 000. El costo se calcula por peso y zona.',
  },
  {
    icon: 'ticket',
    title: 'Cupones que sí se notan.',
    text: 'Usa BIENVENIDA10 en tu primera compra y ahorra un 10 %.',
  },
  {
    icon: 'chat',
    title: 'Un asistente que conoce tus pedidos.',
    text: 'Pregúntale por stock, envíos o el estado de tus órdenes, a cualquier hora.',
  },
];

const pad = (number) => String(number).padStart(2, '0');

/**
 * Slider de mensajes de marca: avanza solo cada 6 s con una barra de progreso,
 * se pausa con el mouse o el foco encima, y se controla con las flechas o los indicadores.
 */
export function BrandSlider() {
  const slider = useAutoSlider(SLIDES.length);
  const slide = SLIDES[slider.index];

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') slider.next();
    if (event.key === 'ArrowLeft') slider.previous();
  }

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Novedades de Circuito"
      onKeyDown={handleKeyDown}
      {...slider.hoverHandlers}
      className="max-w-md"
    >
      {/* key = índice: cada diapositiva nueva se monta y vuelve a animar su entrada */}
      <article
        key={slider.index}
        aria-roledescription="diapositiva"
        aria-label={`${slider.index + 1} de ${SLIDES.length}`}
        aria-live={slider.paused ? 'polite' : 'off'}
        className="min-h-72"
      >
        <div className="text-accent">
          <SlideIcon name={slide.icon} />
        </div>
        <p className="animate-slide-in mt-8 font-display text-5xl leading-[1.05] font-semibold tracking-tight">
          {slide.title}
        </p>
        <p className="animate-slide-in mt-6 opacity-60" style={{ animationDelay: '120ms' }}>
          {slide.text}
        </p>
      </article>

      <div className="mt-10 flex items-center gap-4">
        <div className="flex flex-1 gap-2">
          {SLIDES.map((item, position) => (
            <button
              key={item.icon}
              type="button"
              onClick={() => slider.goTo(position)}
              aria-label={`Ver diapositiva ${position + 1}: ${item.title}`}
              aria-current={position === slider.index}
              className="group flex-1 py-3"
            >
              <span className="relative block h-0.5 overflow-hidden bg-current/20 transition-[height] duration-200 group-hover:h-1">
                <span
                  className={`absolute inset-0 origin-left bg-accent ${
                    position === slider.index && slider.canAutoplay ? 'animate-progress' : ''
                  }`}
                  style={
                    position === slider.index && slider.canAutoplay
                      ? { animationDuration: `${SLIDE_DURATION_MS}ms`, animationPlayState: slider.paused ? 'paused' : 'running' }
                      : { transform: `scaleX(${position <= slider.index ? 1 : 0})` }
                  }
                  onAnimationEnd={position === slider.index ? slider.next : undefined}
                />
              </span>
            </button>
          ))}
        </div>

        {slider.canAutoplay && (
          <button
            type="button"
            onClick={slider.togglePause}
            aria-label={slider.pausedByUser ? 'Reanudar' : 'Pausar'}
            className="grid size-8 place-items-center opacity-60 transition-opacity hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
              {slider.pausedByUser ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />}
            </svg>
          </button>
        )}

        <span className="font-mono text-xs tabular opacity-50">
          {pad(slider.index + 1)} / {pad(SLIDES.length)}
        </span>
      </div>
    </section>
  );
}
