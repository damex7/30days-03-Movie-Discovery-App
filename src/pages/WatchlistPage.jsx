import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import MovieGrid from '../components/MovieGrid'
import EmptyState from '../components/EmptyState'

/*
  No fetching here at all: the watchlist stores a snapshot of each movie,
  so this page renders straight from localStorage, even offline.
*/
export default function WatchlistPage() {
  const { items, count } = useWatchlist()
  useDocumentTitle('Your watchlist')

  // When you remove a movie, its card (and the button you just pressed)
  // disappears, and the browser drops focus to <body>. Put it on the
  // heading instead so keyboard users don't lose their place.
  const headingRef = useRef(null)
  const prevCount = useRef(count)
  useEffect(() => {
    const removed = count < prevCount.current
    prevCount.current = count
    if (removed && (document.activeElement === document.body || !document.activeElement)) {
      headingRef.current?.focus()
    }
  }, [count])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-3">
        <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-extrabold tracking-tight outline-none sm:text-5xl">
          Your watchlist
        </h1>
        <p className="font-mono text-sm text-ink-soft" aria-live="polite">
          {count === 1 ? '1 film saved' : `${count} films saved`}
        </p>
      </div>

      {count === 0 ? (
        <EmptyState eyebrow="Empty reel" title="Your watchlist is empty">
          <p>
            Tap the bookmark on any movie to save it here. It stays saved in this browser.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-accent transition hover:brightness-110"
          >
            Discover movies
          </Link>
        </EmptyState>
      ) : (
        <MovieGrid movies={items} />
      )}
    </div>
  )
}
