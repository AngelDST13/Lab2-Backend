export function StatTile({ label, value, note, index = 0 }) {
  return (
    <div style={{ '--i': index }} className="stagger animate-rise border-t border-ink pt-4">
      <p className="label-caps">{label}</p>
      <p className="mt-2 font-mono text-3xl tracking-tight tabular">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
