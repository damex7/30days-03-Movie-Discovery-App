import { Link, useSearchParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { usePagedMovies } from '../hooks/usePagedMovies'
import { discoverByGenre, getGenres, getPopular, getTrending } from '../lib/tmdb'
import MovieRow from '../components/MovieRow'
import GenreFilter from '../components/GenreFilter'
import PagedMovieList from '../components/PagedMovieList'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { RowSkeleton } from '../components/Skeletons'

export default function HomePage() {
  useDocumentTitle(null)
  const [searchParams, setSearchParams] = useSearchParams()
  // URL values are always strings; Number('') is 0, so `|| null` means "no genre".
  const genreId = Number(searchParams.get('genre')) || null

  // Three independent requests. Each section loads and fails on its own,
  // so a broken genre list never blanks out the trending row.
  const trending = useFetch((signal) => getTrending({ signal }), [])
  const genres = useFetch(() => getGenres(), [])
  const list = usePagedMovies(
    ({ page, signal }) =>
      genreId ? discoverByGenre({ genreId, page, signal }) : getPopular({ page, signal }),
    [genreId],
  )

  const selectGenre = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('genre', id)
    else next.delete('genre')
    // replace: don't add a history entry per chip click, so Back leaves the page.
    // preventScrollReset: keep the scroll position while filtering.
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  const genreName = genres.data?.find((g) => g.id === genreId)?.name

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-10 sm:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">The weekly programme</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
          Find your next favourite film.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">
          What the world is watching this week, what’s popular right now, and a watchlist that remembers.
        </p>
        <Link
          to="/search"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-accent transition hover:brightness-110"
        >
          Search movies <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section aria-labelledby="trending-heading">
        <SectionHeading id="trending-heading" eyebrow="Reel 01" title="Trending this week" />
        {trending.status === 'loading' && <RowSkeleton />}
        {trending.status === 'error' && <ErrorState error={trending.error} onRetry={trending.retry} />}
        {trending.status === 'success' &&
          (trending.data.results.length ? (
            <MovieRow movies={trending.data.results} label="Trending movies this week" />
          ) : (
            <EmptyState title="Nothing trending right now" />
          ))}
      </section>

      <section aria-labelledby="popular-heading" className="mt-12">
        <SectionHeading
          id="popular-heading"
          eyebrow="Reel 02"
          title={genreName ? `Popular in ${genreName}` : 'Popular right now'}
        />
        <div className="mb-6">
          <GenreFilter
            genres={genres.data ?? []}
            status={genres.status}
            error={genres.error}
            onRetry={genres.retry}
            selectedId={genreId}
            onSelect={selectGenre}
          />
        </div>
        <PagedMovieList
          list={list}
          empty={<EmptyState title={`No popular ${genreName ?? ''} movies found`}>Try another genre.</EmptyState>}
        />
      </section>
    </div>
  )
}

function SectionHeading({ id, eyebrow, title }) {
  return (
    <div className="mb-4 flex items-baseline gap-3 border-b-2 border-ink pb-2">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</span>
      <h2 id={id} className="text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
    </div>
  )
}
