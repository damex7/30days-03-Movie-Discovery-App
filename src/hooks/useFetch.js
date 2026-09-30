import { useEffect, useState } from 'react'

/*
  useFetch: a tiny, reusable "load some data" hook.

  const { status, data, error, retry } = useFetch(
    (signal) => getMovie(id, { signal }),
    [id],
  )

  - `fetcher` receives an AbortSignal and returns a promise.
  - `deps` works like useEffect's dependency array: when it changes, the old
    request is aborted and a new one starts.
  - `status` is ONE value ('loading' | 'success' | 'error') instead of
    separate isLoading / isError booleans, so impossible combinations like
    "loading AND error" can't happen.
*/
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  // Bumping this number re-runs the effect: that's all "Retry" is.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading', data: null, error: null })

    fetcher(controller.signal)
      .then((data) => {
        // If this request was cancelled, a newer one owns the state now.
        if (controller.signal.aborted) return
        setState({ status: 'success', data, error: null })
      })
      .catch((error) => {
        // Aborting makes fetch reject with an AbortError. That isn't a real
        // failure, it just means "the user moved on", so we ignore it.
        if (controller.signal.aborted) return
        setState({ status: 'error', data: null, error })
      })

    // Cleanup runs when deps change or the component unmounts. Aborting here
    // is what prevents a slow, outdated response from overwriting a newer one
    // (the classic "race condition" when typing fast or clicking quickly).
    return () => controller.abort()
    // The caller controls re-fetching through `deps`, exactly like useEffect.
  }, [...deps, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
