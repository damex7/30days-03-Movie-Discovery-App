/*
  tmdb.js: the ONLY file in the app that knows TMDB's URLs, the token,
  and how images are sized. Components call these functions and get plain
  data back, so if TMDB changes (or we add a proxy later) we edit one file.
*/

const API_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Vite exposes only variables prefixed with VITE_ to browser code, and it
// inlines them at BUILD time (that's why Vercel needs a redeploy after
// changing the value).
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

/**
 * Low-level request helper. Every exported function goes through here, so
 * auth headers, URL building and error handling live in exactly one place.
 *
 * @param {string} path    e.g. '/movie/popular'
 * @param {object} params  query string values; undefined/null/'' are skipped
 * @param {{signal?: AbortSignal}} options  pass the AbortController's signal
 */
async function request(path, params = {}, { signal } = {}) {
  if (!TOKEN) {
    throw new Error(
      'Missing TMDB token. Copy .env.example to .env.local, add VITE_TMDB_TOKEN, then restart the dev server.',
    )
  }

  const url = new URL(API_BASE + path)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url, {
    signal,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  })

  // fetch() only rejects on NETWORK failure. A 401 or 404 is still a
  // "successful" fetch, so we must check response.ok ourselves.
  if (!response.ok) {
    let message = `TMDB request failed (${response.status})`
    try {
      const body = await response.json()
      if (body.status_message) message = body.status_message
    } catch {
      // body wasn't JSON; keep the generic message
    }
    if (response.status === 401) message = 'TMDB rejected the token (401). Check VITE_TMDB_TOKEN in .env.local.'
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return response.json()
}

/* ---------- Lists (all paginated: { page, results, total_pages }) ---------- */

export function getTrending({ signal } = {}) {
  return request('/trending/movie/week', {}, { signal })
}

export function getPopular({ page = 1, signal } = {}) {
  return request('/movie/popular', { page }, { signal })
}

/** Popular movies filtered by one genre id. */
export function discoverByGenre({ genreId, page = 1, signal } = {}) {
  return request(
    '/discover/movie',
    {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      include_adult: false,
      // without a vote floor, discover surfaces lots of obscure, poster-less titles
      'vote_count.gte': 50,
      page,
    },
    { signal },
  )
}

export function searchMovies({ query, page = 1, signal } = {}) {
  return request('/search/movie', { query, page, include_adult: false }, { signal })
}

/* ---------- Single items ---------- */

/**
 * One movie with its cast and videos. append_to_response bundles three
 * endpoints into one HTTP request, which is faster than three fetches.
 */
export function getMovie(id, { signal } = {}) {
  return request(`/movie/${id}`, { append_to_response: 'credits,videos' }, { signal })
}

// Genres almost never change, so we keep the promise in memory and every
// caller shares one request for the life of the page.
let genresPromise = null
export function getGenres() {
  if (!genresPromise) {
    genresPromise = request('/genre/movie/list').then((data) => data.genres)
    // if it fails, forget it so a Retry can try again
    genresPromise.catch(() => {
      genresPromise = null
    })
  }
  return genresPromise
}

/* ---------- Helpers that turn raw TMDB data into display values ---------- */

/**
 * Build an image URL. Sizes TMDB supports include:
 * posters: w185 w342 w500 w780 | backdrops: w780 w1280 original | profiles: w185
 * Returns null when there is no image so components can show a placeholder.
 */
export function imageUrl(path, size = 'w342') {
  return path ? `${IMAGE_BASE}/${size}${path}` : null
}

/** Pick the best YouTube trailer: official trailers first, then any trailer, then a teaser. */
export function findTrailer(videos) {
  const youtube = (videos?.results ?? []).filter((v) => v.site === 'YouTube')
  const pick =
    youtube.find((v) => v.type === 'Trailer' && v.official) ??
    youtube.find((v) => v.type === 'Trailer') ??
    youtube.find((v) => v.type === 'Teaser')
  return pick ? { name: pick.name, url: `https://www.youtube.com/watch?v=${pick.key}` } : null
}

export function releaseYear(movie) {
  return movie?.release_date ? movie.release_date.slice(0, 4) : null
}

export function formatRuntime(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

export function formatRating(vote) {
  return vote ? vote.toFixed(1) : null
}
