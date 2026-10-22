export const inputClassName =
  'h-11 w-full border border-line bg-card px-3 text-sm text-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-ink focus:outline-none disabled:bg-paper-deep disabled:text-muted';

export function FormField({ id, label, hint, children }) {
  return (
    <div className="group/field space-y-1.5">
      {/* La etiqueta se oscurece mientras su campo tiene el foco */}
      <label htmlFor={id} className="label-caps block transition-colors duration-200 group-focus-within/field:text-ink">
        {label}
      </label>
      {/* Al enfocar el campo, una línea de acento se desliza por su borde inferior */}
      <div className="relative">
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out-soft group-focus-within/field:scale-x-100"
        />
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
