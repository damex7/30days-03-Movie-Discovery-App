/* A successful request with nothing to show is NOT an error, so it gets its own calm state. */
export default function EmptyState({ title, children, eyebrow = 'Nothing showing' }) {
  return (
    <div role="status" className="mx-auto max-w-md px-6 py-12 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold break-words">{title}</h2>
      {children && <div className="mt-3 text-ink-soft">{children}</div>}
    </div>
  )
}
