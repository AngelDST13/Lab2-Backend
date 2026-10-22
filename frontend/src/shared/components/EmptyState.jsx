export function EmptyState({ title, children }) {
  return (
    <div className="border-y border-line py-16 text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      {children && <div className="mt-3 text-sm text-muted">{children}</div>}
    </div>
  );
}
