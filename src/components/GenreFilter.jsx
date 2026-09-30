import ErrorState from './ErrorState'

/*
  Genre "chips". They are toggle buttons (aria-pressed) inside a labelled
  group, which reads more naturally than a <select> for ~19 short options
  and is fully keyboard operable (Tab + Enter/Space).
  On small screens the row scrolls sideways instead of wrapping into a wall.
*/
export default function GenreFilter({ genres, status, error, onRetry, selectedId, onSelect }) {
  if (status === 'error') {
    return <ErrorState compact compactLabel="Couldn’t load genres" error={error} onRetry={onRetry} />
  }

  const chip = (active) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-xs whitespace-nowrap transition ${
      active ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink hover:border-ink'
    }`

  return (
    <div role="group" aria-label="Filter by genre" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:flex-wrap sm:px-6">
      <button type="button" aria-pressed={!selectedId} onClick={() => onSelect(null)} className={chip(!selectedId)}>
        All genres
      </button>
      {status === 'loading'
        ? Array.from({ length: 8 }, (_, i) => (
            <span key={i} aria-hidden="true" className="h-8 w-20 shrink-0 animate-shimmer rounded-full bg-skeleton" />
          ))
        : genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              aria-pressed={selectedId === genre.id}
              onClick={() => onSelect(genre.id)}
              className={chip(selectedId === genre.id)}
            >
              {genre.name}
            </button>
          ))}
    </div>
  )
}
