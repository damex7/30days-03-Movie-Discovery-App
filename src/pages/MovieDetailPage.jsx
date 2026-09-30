import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { findTrailer, formatRating, formatRuntime, getMovie, imageUrl, releaseYear } from '../lib/tmdb'
import Poster from '../components/Poster'
import WatchlistButton from '../components/WatchlistButton'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { DetailSkeleton } from '../components/Skeletons'

export default function MovieDetailPage() {
  const { id } = useParams()
  const isValidId = /^\d+$/.test(id)

  // [id] as deps: going from /movie/1 to /movie/2 aborts the first request.
  // With an invalid id we skip the network entirely.
  const { status, data: movie, error, retry } = useFetch(
    (signal) => (isValidId ? getMovie(id, { signal }) : Promise.reject(Object.assign(new Error('Not found'), { status: 404 }))),
    [id],
  )

  useDocumentTitle(movie ? `${movie.title}${releaseYear(movie) ? ` (${releaseYear(movie)})` : ''}` : null)

  if (status === 'loading') return <DetailSkeleton />

  if (status === 'error') {
    // A 404 won't fix itself, so offer a way out instead of Retry.
    if (error.status === 404) {
      return (
        <div className="px-4 py-16">
          <EmptyState eyebrow="Error 404" title="We couldn’t find that movie">
            <Link to="/" className="font-mono text-sm text-accent underline underline-offset-4">
              Back to Discover
            </Link>
          </EmptyState>
        </div>
      )
    }
    return (
      <div className="px-4 py-16">
        <ErrorState title="Couldn’t load this movie" error={error} onRetry={retry} />
      </div>
    )
  }

  return <MovieDetail movie={movie} />
}

function MovieDetail({ movie }) {
  const year = releaseYear(movie)
  const runtime = formatRuntime(movie.runtime)
  const rating = formatRating(movie.vote_average)
  const trailer = findTrailer(movie.videos)
  const cast = (movie.credits?.cast ?? []).slice(0, 12)
  const backdrop = imageUrl(movie.backdrop_path, 'w1280')

  return (
    <article>
      {/* Backdrop: purely decorative, so alt="" hides it from screen readers. */}
      <div className="relative h-48 overflow-hidden bg-ink sm:h-80">
        {backdrop && <img src={backdrop} alt="" className="h-full w-full object-cover opacity-90" />}
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/30 to-transparent" />
        <div className="absolute top-4 left-0 w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <BackButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-24 flex flex-col gap-6 sm:-mt-40 sm:flex-row sm:gap-10">
          {/* relative z-10: the backdrop above is positioned, so without this it paints over the poster. */}
          <div className="relative z-10 w-40 shrink-0 sm:w-64">
            <div className="rounded-lg border border-line bg-card p-2 shadow-[6px_6px_0_var(--color-ink)]">
              <Poster path={movie.poster_path} title={movie.title} size="w500" eager />
            </div>
          </div>

          <div className="min-w-0 flex-1 sm:pt-44">
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance break-words sm:text-5xl">
              {movie.title}
            </h1>
            {movie.tagline && <p className="mt-2 text-lg text-ink-soft italic">{movie.tagline}</p>}

            {/* A description list: label/value pairs, read as such by screen readers. */}
            <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm">
              <Meta label="Released" value={year ?? 'TBA'} />
              {runtime && <Meta label="Runtime" value={runtime} />}
              {rating && (
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Rating</dt>
                  <dd className="rotate-[-3deg] rounded-sm border-2 border-teal px-2 py-0.5 font-semibold text-teal">
                    ★ {rating}
                    <span className="text-xs font-normal"> / 10</span>
                  </dd>
                </div>
              )}
            </dl>

            {movie.genres?.length > 0 && (
              <ul aria-label="Genres" className="mt-4 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <li key={genre.id}>
                    {/* Reuses the Home page's URL-based filter. */}
                    <Link
                      to={`/?genre=${genre.id}`}
                      className="inline-block rounded-full border border-line bg-card px-3 py-1 font-mono text-xs transition hover:border-ink"
                    >
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <WatchlistButton movie={movie} variant="full" />
              {trailer && (
                <a
                  href={trailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-on-accent transition hover:brightness-110"
                >
                  <span aria-hidden="true">▶</span> Watch trailer
                  <span className="sr-only">(opens YouTube in a new tab)</span>
                </a>
              )}
            </div>

            <section aria-labelledby="overview-heading" className="mt-8 max-w-2xl">
              <h2 id="overview-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
                Synopsis
              </h2>
              <p className="mt-2 text-lg leading-relaxed">{movie.overview || 'No synopsis available yet.'}</p>
            </section>
          </div>
        </div>

        <section aria-labelledby="cast-heading" className="mt-12">
          <h2 id="cast-heading" className="mb-4 border-b-2 border-ink pb-2 text-2xl font-bold tracking-tight">
            Top cast
          </h2>
          {cast.length === 0 ? (
            <p className="text-ink-soft">No cast information yet.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
              {cast.map((person) => (
                <li key={person.credit_id ?? person.id} className="rounded-lg border border-line bg-card p-2">
                  <CastPhoto person={person} />
                  <p className="mt-2 px-1 text-sm leading-tight font-semibold break-words sm:text-base">{person.name}</p>
                  {person.character && <p className="mt-0.5 px-1 pb-1 font-mono text-[11px] break-words text-ink-soft sm:text-xs">{person.character}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  )
}

function Meta({ label, value }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-xs uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

// No photo: show initials on the film-leader stripes, same idea as Poster.
function CastPhoto({ person }) {
  const src = imageUrl(person.profile_path, 'w185')
  if (!src) {
    const initials = person.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
    return (
      <div aria-hidden="true" className="film-leader grid aspect-[2/3] place-items-center rounded font-mono text-2xl text-ink-soft sm:text-3xl">
        {initials}
      </div>
    )
  }
  return <img src={src} alt={`Photo of ${person.name}`} loading="lazy" className="aspect-[2/3] w-full rounded bg-skeleton object-cover" />
}

// Go back if we came from inside the app; otherwise (a shared link opened
// directly) "back" would leave the site, so go to Discover instead.
// React Router stores the in-app history position as history.state.idx.
function BackButton() {
  const navigate = useNavigate()
  const canGoBack = (window.history.state?.idx ?? 0) > 0
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
      className="rounded-full bg-paper/90 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink shadow backdrop-blur transition hover:bg-paper"
    >
      ← {canGoBack ? 'Back' : 'Discover'}
    </button>
  )
}
