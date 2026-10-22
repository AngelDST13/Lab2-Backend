export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
      <div className="max-w-2xl">
        {eyebrow && <p className="label-caps mb-3">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-none font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-ink-soft">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
