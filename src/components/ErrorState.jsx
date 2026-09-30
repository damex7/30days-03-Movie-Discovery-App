/*
  Shown when a request fails. role="alert" makes screen readers announce it
  immediately. `compact` is used under an existing list (a failed "Load more")
  so the movies already on screen stay visible.
*/
export default function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
  compact = false,
  compactLabel = 'Couldn’t load more',
}) {
  const message = error?.message ?? 'The request failed. Check your connection and try again.'

  if (compact) {
    return (
      <div role="alert" className="flex flex-wrap items-center justify-center gap-3 font-mono text-sm">
        <span className="text-accent">
          {compactLabel}: {message}
        </span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="underline underline-offset-4 hover:text-accent">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div role="alert" className="perforated mx-auto max-w-md rounded-lg border border-dashed border-accent bg-card px-6 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Reel jammed</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-ink-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-full bg-accent px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-on-accent transition hover:brightness-110"
        >
          Retry
        </button>
      )}
    </div>
  )
}
