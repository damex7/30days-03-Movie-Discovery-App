import { Link, NavLink } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'

const navClass = ({ isActive }) =>
  `rounded-full px-2 py-1.5 font-mono text-[11px] uppercase transition sm:px-3 sm:text-sm sm:tracking-wider ${
    isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-line/60'
  }`

export default function Header() {
  const { count: watchlistCount } = useWatchlist()
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      {/* Skip link: first thing a keyboard user tabs to, jumps past the nav. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <Link to="/" className="group flex items-baseline gap-2" aria-label="Marquee, home">
          <span className="text-xl font-extrabold tracking-tight sm:text-3xl">
            Marquee<span className="text-accent">.</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft md:inline">
            Now showing
          </span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            <li>
              <NavLink to="/" end className={navClass}>
                Discover
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={navClass}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/watchlist" className={navClass}>
                {/* The visible count is also read out as part of the link name. */}
                Watchlist
                {watchlistCount > 0 && (
                  <span className="ml-1 inline-grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] leading-5 text-on-accent">
                    {watchlistCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
