import { useEffect, useState } from 'react'

// TMDB refuses page numbers above 500 even when total_pages says more.
const TMDB_MAX_PAGE = 500

const initialState = { items: [], totalPages: 0, status: 'loading', error: null }

/*
  usePagedMovies: like useFetch, but for "Load more" lists.

  const list = usePagedMovies(
    ({ page, signal }) => searchMovies({ query, page, signal }),
    [query],
  )

  Why a separate hook? useFetch REPLACES its data on every request. Load
  more needs to APPEND page 2 to page 1, and to reset back to page 1 when
  the query or genre changes. Same AbortController pattern underneath.
*/
export function usePagedMovies(fetchPage, deps = []) {
  const [page, setPage] = useState(1)
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  // When deps change (new search, new genre) start over at page 1.
  // Doing this DURING render (not in an effect) is React's recommended way
  // to reset state when an input changes: it avoids one wasted render and
  // a wasted request for the old page number.
  const depsKey = JSON.stringify(deps)
  const [prevDepsKey, setPrevDepsKey] = useState(depsKey)
  if (depsKey !== prevDepsKey) {
    setPrevDepsKey(depsKey)
    setPage(1)
    setState(initialState)
  }

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ ...s, status: 'loading', error: null }))

    fetchPage({ page, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setState((s) => ({
          items: page === 1 ? data.results : appendUnique(s.items, data.results),
          totalPages: data.total_pages,
          status: 'success',
          error: null,
        }))
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        // Keep the movies already shown: a failed page 3 shouldn't wipe pages 1 and 2.
        setState((s) => ({ ...s, status: 'error', error }))
      })

    return () => controller.abort()
  }, [depsKey, page, attempt])

  const lastPage = Math.min(state.totalPages, TMDB_MAX_PAGE)

  return {
    ...state,
    page,
    hasMore: page < lastPage,
    // "first load" vs "loading more" need different UI (skeletons vs a busy button)
    isFirstLoad: state.status === 'loading' && state.items.length === 0,
    loadMore: () => setPage((p) => p + 1),
    retry: () => setAttempt((n) => n + 1),
  }
}

// Popular lists shift while you page through them, so TMDB sometimes returns
// the same movie on two pages. Duplicate ids would also break React keys.
function appendUnique(existing, incoming) {
  const seen = new Set(existing.map((m) => m.id))
  return [...existing, ...incoming.filter((m) => !seen.has(m.id))]
}
