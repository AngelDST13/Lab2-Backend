export function LoadingState({ label = 'Cargando' }) {
  return (
    <p role="status" className="label-caps py-16">
      {label}
      <span className="inline-block w-6 animate-pulse">…</span>
    </p>
  );
}
