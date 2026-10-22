const VARIANTS = {
  primary: 'bg-ink text-card hover:bg-accent disabled:bg-ink/40',
  secondary: 'border border-ink text-ink hover:bg-ink hover:text-card disabled:border-line disabled:text-muted disabled:hover:bg-transparent',
  danger: 'border border-danger text-danger hover:bg-danger hover:text-card disabled:opacity-50',
  link: 'text-ink underline decoration-line underline-offset-4 hover:decoration-accent disabled:text-muted',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const sizeClass = variant === 'link' ? '' : SIZES[size];

  return (
    <button
      type="button"
      {...props}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-medium transition duration-150 active:scale-98 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${sizeClass} ${className}`}
    >
      {loading ? 'Un momento…' : children}
    </button>
  );
}
