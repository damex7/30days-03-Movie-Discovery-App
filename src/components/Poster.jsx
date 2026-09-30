import { useState } from 'react'
import { imageUrl } from '../lib/tmdb'

/*
  Poster with a designed fallback. Two ways a poster can be "missing":
  1. TMDB has no poster_path (null), so we know before rendering.
  2. The URL exists but the image fails to load, which we catch with onError.
  Both show the same typographic "film leader" card instead of a broken icon.
*/
export default function Poster({ path, title, size = 'w342', className = '', eager = false }) {
  const src = imageUrl(path, size)
  // Remember WHICH url failed (not just "true"), so if this component is
  // reused for a different movie, the new poster gets a fresh chance.
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = failedSrc === src

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`No poster available for ${title}`}
        className={`film-leader flex aspect-[2/3] flex-col justify-between overflow-hidden rounded border border-line p-3 ${className}`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">No poster</span>
        <span className="line-clamp-4 text-lg leading-tight font-semibold break-words">{title}</span>
        <span aria-hidden="true" className="font-mono text-2xl text-accent">✶</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`Poster for ${title}`}
      // Lazy loading: posters far down a long grid aren't downloaded until
      // you scroll near them. The detail page poster is "eager" (above the fold).
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`aspect-[2/3] w-full rounded bg-skeleton object-cover ${className}`}
    />
  )
}
