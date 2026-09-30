/*
  Skeletons mirror the real layout's shape so the page doesn't jump when
  data arrives. They're hidden from screen readers (aria-hidden); the
  wrapping region announces "Loading" once via role="status" instead.
*/

function Block({ className = '' }) {
  return <div className={`bg-skeleton animate-shimmer rounded ${className}`} />
}

export function CardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-lg border border-line bg-card p-2">
      <Block className="aspect-[2/3] w-full" />
      <Block className="mt-3 h-4 w-4/5" />
      <Block className="mt-2 mb-1 h-3 w-1/3" />
    </div>
  )
}

export function GridSkeleton({ count = 10, label = 'Loading movies' }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: count }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function RowSkeleton({ count = 6 }) {
  return (
    <div role="status" aria-live="polite" className="flex gap-3 overflow-hidden sm:gap-4">
      <span className="sr-only">Loading trending movies…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-36 shrink-0 sm:w-44">
          <CardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading movie…</span>
      <div aria-hidden="true">
        <Block className="h-48 w-full rounded-none sm:h-72" />
        <div className="mx-auto -mt-24 flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:px-6">
          <Block className="aspect-[2/3] w-40 shrink-0 border-4 border-paper sm:w-60" />
          <div className="flex-1 space-y-3 pt-4 sm:pt-28">
            <Block className="h-9 w-2/3" />
            <Block className="h-4 w-1/3" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-11/12" />
            <Block className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}
