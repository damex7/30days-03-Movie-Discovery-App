import MovieCard from './MovieCard'

/*
  Horizontal scroller. It works with touch, trackpad and keyboard: tabbing
  to a card the browser scrolls it into view, so no arrow buttons or JS needed.
  snap-x makes swipes stop neatly on a card edge; scroll-px (scroll-padding)
  makes snapping respect the side padding, or the first card gets pulled flush left.
*/
export default function MovieRow({ movies, label }) {
  return (
    <ul aria-label={label} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pt-1 pb-4 sm:-mx-6 sm:gap-4 sm:scroll-px-6 sm:px-6">
      {movies.map((movie) => (
        <li key={movie.id} className="w-36 shrink-0 snap-start sm:w-44">
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  )
}
