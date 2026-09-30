/*
  TMDB's API terms require this exact notice plus their logo, and the logo
  must be less prominent than our own branding. It links back to TMDB.
*/
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <img src="/tmdb-logo.svg" alt="The Movie Database (TMDB)" width="40" height="40" className="h-10 w-10" />
          <span className="max-w-xs text-sm text-ink-soft">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </span>
        </a>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Marquee · Day 3 / 30</p>
      </div>
    </footer>
  )
}
