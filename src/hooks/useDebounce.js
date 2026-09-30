import { useEffect, useState } from 'react'

/*
  Returns `value`, but only after it has stopped changing for `delay` ms.
  Typing "batman" fires ONE search instead of six ("b", "ba", "bat"...).
  Each keystroke clears the previous timer in the effect cleanup.
*/
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
