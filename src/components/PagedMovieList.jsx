import MovieGrid from './MovieGrid'
import { GridSkeleton } from './Skeletons'
import ErrorState from './ErrorState'

/*
  Renders the output of usePagedMovies in all its states. Home and Search
  both use it, so "loading / error / empty / list + load more" is written once.

  Order matters:
  1. first load       -> skeleton grid
  2. first load failed -> full error with Retry
  3. loaded, 0 results -> the page's own empty state
  4. otherwise         -> the grid, plus Load more / a compact error below it
*/
export default function PagedMovieList({ list, empty }) {
  const { items, status, error, hasMore, isFirstLoad, loadMore, retry } = list

  if (isFirstLoad) return <GridSkeleton />
  if (status === 'error' && items.length === 0) return <ErrorState error={error} onRetry={retry} />
  if (status === 'success' && items.length === 0) return empty

  const loadingMore = status === 'loading'

  return (
    <>
      <MovieGrid movies={items} />
      <div className="mt-8 flex justify-center">
        {status === 'error' ? (
          <ErrorState compact error={error} onRetry={retry} />
        ) : hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            // aria-busy + the text change tell screen readers something is happening
            aria-busy={loadingMore}
            className="rounded-full border-2 border-ink px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wider transition hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">That’s a wrap. End of list.</p>
        )}
      </div>
    </>
  )
}
