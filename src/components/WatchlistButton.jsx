import { useWatchlist } from '../hooks/useWatchlist'

/*
  A toggle button. aria-pressed tells screen readers it's on/off, and the
  label names the movie, because "Add to watchlist" x 20 on a grid is useless
  when a screen reader lists all the buttons.
*/
export default function WatchlistButton({ movie, variant = 'icon', className = '' }) {
  const { has, toggle } = useWatchlist()
  const saved = has(movie.id)
  const label = saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`

  if (variant === 'full') {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => toggle(movie)}
        className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider transition ${
          saved ? 'border-accent bg-accent text-on-accent' : 'border-ink text-ink hover:bg-ink hover:text-paper'
        } ${className}`}
      >
        <BookmarkIcon filled={saved} />
        {saved ? 'On your watchlist' : 'Add to watchlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() => toggle(movie)}
      className={`grid h-10 w-10 place-items-center rounded-full border shadow-sm transition ${
        saved ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card/95 text-ink hover:text-accent'
      } ${className}`}
    >
      <BookmarkIcon filled={saved} />
    </button>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M6 3h12v18l-6-4.5L6 21z" />
    </svg>
  )
}
