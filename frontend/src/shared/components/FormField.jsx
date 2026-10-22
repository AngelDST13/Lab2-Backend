export const inputClassName =
  'h-11 w-full border border-line bg-card px-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-ink focus:outline-none disabled:bg-paper-deep disabled:text-muted';

export function FormField({ id, label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label-caps block">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
