import { Link } from 'react-router-dom'
import Poster from './Poster'
import WatchlistButton from './WatchlistButton'
import { formatRating, releaseYear } from '../lib/tmdb'

/*
  The watchlist button sits NEXT TO the link, not inside it: a button nested
  in a link is invalid HTML and confuses keyboard and screen-reader users
  (which one does Enter activate?). We position it over the poster with CSS.
*/
export default function MovieCard({ movie }) {
  const year = releaseYear(movie)
  const rating = formatRating(movie.vote_average)
  // Without this, the link's name is built from everything inside it:
  // "Poster for Dune, Rated 8.1 out of 10, Dune, 2021" (title said twice).
  const linkLabel = [movie.title, year, rating && `rated ${rating} out of 10`].filter(Boolean).join(', ')

  return (
    <article className="perforated group relative h-full rounded-lg border border-line bg-card p-2 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_var(--color-ink)]">
      <Link to={`/movie/${movie.id}`} aria-label={linkLabel} className="block rounded">
        <div className="relative">
          <Poster path={movie.poster_path} title={movie.title} />
          {rating && (
            <span className="absolute bottom-2 left-2 rotate-[-4deg] rounded-sm border-2 border-teal bg-card px-1.5 py-0.5 font-mono text-xs font-semibold text-teal">
              <span className="sr-only">Rated </span>
              {rating}
              <span className="sr-only"> out of 10</span>
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 px-1 text-base leading-snug font-semibold group-hover:text-accent">{movie.title}</h3>
        <p className="mt-1 px-1 pb-1 font-mono text-xs text-ink-soft">{year ?? 'TBA'}</p>
      </Link>
      <WatchlistButton movie={movie} className="absolute top-3.5 right-3.5" />
    </article>
  )
}
