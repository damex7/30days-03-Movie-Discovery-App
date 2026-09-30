import { useEffect } from 'react'

// Sets the browser tab title. Screen readers also announce it on navigation,
// which helps orientation in a single-page app.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Marquee` : 'Marquee · Movie Discovery'
  }, [title])
}
