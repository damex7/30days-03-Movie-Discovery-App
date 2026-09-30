import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/*
  A single-page app doesn't reload between pages, so the browser keeps your
  scroll position: click a movie at the bottom of the grid and the detail
  page would open scrolled down. This resets it when the PATH changes
  (not the ?query, so typing in search doesn't jump the page).
*/
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
