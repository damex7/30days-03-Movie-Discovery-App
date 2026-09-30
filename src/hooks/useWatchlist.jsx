import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/*
  Watchlist = one shared list in React Context, persisted to localStorage.

  We save a small SNAPSHOT of each movie (not just its id), so the Watchlist
  page renders instantly and offline, with zero API calls.
  The ":v1" in the key lets us change the saved shape later without
  choking on old data.
*/
const STORAGE_KEY = 'marquee:watchlist:v1'

const WatchlistContext = createContext(null)

function loadFromStorage() {
  // localStorage can throw (privacy mode, blocked storage) and its contents
  // can be anything (edited by hand, older app version), so be defensive.
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.id === 'number') : []
  } catch {
    return []
  }
}

function toSnapshot(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path ?? null,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average ?? 0,
    addedAt: Date.now(),
  }
}

export function WatchlistProvider({ children }) {
  // Passing a FUNCTION to useState means it only runs on the first render,
  // not on every re-render (a "lazy initializer").
  const [items, setItems] = useState(loadFromStorage)

  // Save whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full or blocked: the app still works for this visit
    }
  }, [items])

  // If the watchlist changes in ANOTHER tab, the browser fires "storage" here.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setItems(loadFromStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // useMemo keeps the same object between renders unless `items` changes,
  // so components using the context don't re-render for no reason.
  const value = useMemo(() => {
    const ids = new Set(items.map((m) => m.id))
    return {
      items,
      count: items.length,
      has: (id) => ids.has(id),
      toggle: (movie) =>
        setItems((current) =>
          current.some((m) => m.id === movie.id)
            ? current.filter((m) => m.id !== movie.id)
            : [toSnapshot(movie), ...current],
        ),
      remove: (id) => setItems((current) => current.filter((m) => m.id !== id)),
    }
  }, [items])

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (!context) throw new Error('useWatchlist must be used inside <WatchlistProvider>')
  return context
}
