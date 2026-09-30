import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { usePagedMovies } from '../hooks/usePagedMovies'
import { searchMovies } from '../lib/tmdb'
import PagedMovieList from '../components/PagedMovieList'
import EmptyState from '../components/EmptyState'

/*
  The URL (?q=...) is the single source of truth for WHAT is searched.
  The input's local state is only what you're TYPING. Flow:

    type -> text -> (400ms quiet) -> debounced -> URL ?q= -> fetch

  That's why refresh and shared links work: the fetch never reads the
  input, only the URL.
*/
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()

  const [text, setText] = useState(query)
  const debounced = useDebounce(text.trim(), 400)

  // 1) Typing -> URL, whenever the debounced value settles.
  //    Gotcha: React Router gives us a NEW setSearchParams function every
  //    time the URL changes. If it were an effect dependency, clicking
  //    "Search" in the nav (URL -> /search) would re-run this effect and
  //    write the stale debounced text straight back into the URL.
  //    useEffectEvent (React 19.2+) solves exactly this: the effect re-runs
  //    ONLY when `debounced` changes, but the event always sees fresh values.
  const writeQueryToUrl = useEffectEvent((value) => {
    if (value === query) return
    // replace: one history entry per search session, not one per pause in typing
    setSearchParams(value ? { q: value } : {}, { replace: true })
  })

  useEffect(() => {
    writeQueryToUrl(debounced)
  }, [debounced])

  // 2) URL -> input, for changes that did NOT come from typing
  //    (Back/Forward, clicking "Search" in the nav, opening a shared link).
  //    If the URL now differs from what we last wrote (debounced), it came
  //    from outside, so show it in the box. Adjusting state during render,
  //    the same pattern as usePagedMovies' reset.
  const [prevQuery, setPrevQuery] = useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    if (query !== debounced) setText(query)
  }

  const list = usePagedMovies(({ page, signal }) => searchMovies({ query, page, signal }), [query], {
    enabled: query !== '',
  })

  // Pressing Enter searches immediately instead of waiting for the debounce.
  const handleSubmit = (event) => {
    event.preventDefault()
    const value = text.trim()
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  const isTyping = text.trim() !== query
  const inputRef = useRef(null)

  const clear = () => {
    setText('')
    setSearchParams({}, { replace: true })
    inputRef.current?.focus() // keep keyboard users where they were
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Search the archive</h1>

      <form role="search" onSubmit={handleSubmit} className="mt-6 mb-8">
        <label htmlFor="search-input" className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">
          Movie title
        </label>
        <div className="mt-2 flex items-center gap-3 border-b-2 border-ink pb-2 focus-within:border-accent">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Spirited Away"
            autoComplete="off"
            // Focus the box when you arrive with nothing searched yet.
            autoFocus={!query}
            // The underline on the wrapper is the visible focus indicator here.
            className="w-full min-w-0 bg-transparent text-2xl outline-none placeholder:text-ink-soft/60 sm:text-3xl"
          />
          {isTyping && (
            <span className="shrink-0 font-mono text-xs text-ink-soft" aria-hidden="true">
              typing…
            </span>
          )}
          {text && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-line/60 hover:text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Screen readers hear the result count without moving focus. */}
      <p aria-live="polite" className="sr-only">
        {query && list.status === 'success' ? `${list.items.length} movies shown for ${query}` : ''}
      </p>

      {!query ? (
        <EmptyState eyebrow="Ready when you are" title="What do you want to watch?">
          Start typing a title. Results appear as you type, and the link is shareable.
        </EmptyState>
      ) : (
        <PagedMovieList
          list={list}
          empty={
            <EmptyState eyebrow="No results" title={`No movies match “${query}”`}>
              Check the spelling or try a shorter title.
            </EmptyState>
          }
        />
      )}
    </div>
  )
}
