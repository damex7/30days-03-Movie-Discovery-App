# Marquee: Movie Discovery App

**Day 3 of my 30-day build challenge.** Focus: **API integration**. That means fetching data with plain `fetch` and React hooks, plus proper loading, error and empty states. No React Query, SWR or Axios.

Marquee is styled like a printed film-festival programme: warm paper, ink, a vermilion accent, and ticket-stub cards. It follows your system's light or dark setting.

## Features

- **Discover**: movies trending this week (a horizontal row) and a grid of popular movies
- **Genre filter**: switches the popular grid to TMDB's `/discover` endpoint. The genre is kept in the URL (`/?genre=27`)
- **Load more** pagination, with duplicate movies removed across pages
- **Debounced search**: waits about 400ms after you stop typing, then searches. The query lives in the URL (`/search?q=alien`), so it can be shared and survives a refresh. Press Enter to search immediately
- **Movie detail** (`/movie/:id`): backdrop, poster, year, runtime, genres, rating, synopsis, top cast, and a trailer link when one exists
- **Watchlist**: add or remove from any card or the detail page. Saved in `localStorage` and synced between open tabs
- **Every data view** has skeleton loading, an error state with **Retry**, and an empty state
- **Missing posters** get a designed "film leader" placeholder, including images whose URL exists but fails to load
- Responsive down to 360px, keyboard accessible, with a skip link, visible focus rings, and alt text

## Run it locally

Requires Node 20.19+ (or 22.12+).

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Then open http://localhost:5173.

## Add your TMDB token

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings → API** and request a **Developer** key. Any personal or education description is fine.
3. Copy the **API Read Access Token**, the long value that starts with `eyJ...`. Don't use the short "API Key".
4. Put it in `.env.local`:
   ```
   VITE_TMDB_TOKEN=eyJhbGciOi...
   ```
5. **Restart `npm run dev`.** Vite only reads env files at startup.

> **Windows tip:** if you create the file in Notepad, set "Save as type" to *All files*, or it becomes `.env.local.txt`.

`.env.local` is in `.gitignore`, so your token never reaches GitHub.

### Deploying to Vercel

Add `VITE_TMDB_TOKEN` under **Project → Settings → Environment Variables**, then **redeploy**. Vite writes env variables into the JavaScript at *build* time.

`vercel.json` rewrites every path to `index.html`, so refreshing `/movie/603` works instead of returning a 404.

> ⚠️ Any `VITE_*` variable ends up in the JavaScript bundle, where anyone can read it in DevTools. That's acceptable for TMDB's **read-only** token, but never do this with a secret key. For those, call the API from a serverless function instead.

## Where each concept lives

| Concept | File |
| --- | --- |
| All API calls, Bearer auth, URL building, `response.ok` checking | `src/lib/tmdb.js` |
| Image URLs and sizes, picking the best trailer, formatting runtime and rating | `src/lib/tmdb.js` |
| Reusable fetch hook: loading, error and data states, `AbortController`, Retry | `src/hooks/useFetch.js` |
| "Load more" pagination, reset when inputs change, `enabled` option | `src/hooks/usePagedMovies.js` |
| Debouncing a value | `src/hooks/useDebounce.js` |
| Syncing an input with URL search params (`?q=`), `useEffectEvent` | `src/pages/SearchPage.jsx` |
| Filter state in the URL (`?genre=`) | `src/pages/HomePage.jsx` |
| Route params (`/movie/:id`), 404 vs retryable errors | `src/pages/MovieDetailPage.jsx` |
| Global state with Context + `localStorage` persistence, cross-tab sync | `src/hooks/useWatchlist.jsx` |
| Toggle button accessibility (`aria-pressed`) | `src/components/WatchlistButton.jsx` |
| One component for loading, error, empty and list states | `src/components/PagedMovieList.jsx` |
| Skeleton loading states | `src/components/Skeletons.jsx` |
| Error state with Retry | `src/components/ErrorState.jsx` |
| Empty state | `src/components/EmptyState.jsx` |
| Image fallback (`null` path and `onError`) | `src/components/Poster.jsx` |
| Keeping a button *beside* a link (no nested interactive elements) | `src/components/MovieCard.jsx` |
| Moving focus after removing an item | `src/pages/WatchlistPage.jsx` |
| Routing, layout route, 404 route | `src/App.jsx`, `src/components/Layout.jsx` |
| Scroll reset between pages | `src/components/ScrollToTop.jsx` |
| Skip link, nav | `src/components/Header.jsx` |
| TMDB attribution (required by their terms) | `src/components/Footer.jsx` |
| Design tokens (`@theme`), dark mode via CSS variables, focus ring | `src/index.css` |
| SPA rewrite for Vercel | `vercel.json` |
| Environment variable template | `.env.example` |

## How the fetch hook works

```js
const { status, data, error, retry } = useFetch(
  (signal) => getMovie(id, { signal }),
  [id],
)
```

1. When `deps` change, the effect creates an `AbortController` and calls your fetcher with its `signal`.
2. The cleanup function calls `controller.abort()`. That runs when `id` changes *before* the old request finishes, and when the component unmounts.
3. Results from an aborted request are ignored (`if (controller.signal.aborted) return`), so a slow old response can never overwrite a newer one.
4. `status` is a single value (`'loading' | 'success' | 'error'`), not several booleans, so the UI can't end up "loading" and "errored" at the same time.
5. `retry()` increments a counter that is part of the effect's dependencies, which runs the effect again.

## Ideas for later (not built)

- **A serverless proxy** (`/api/tmdb`) so the token stays off the client
- **Response caching**, so going back to Home doesn't refetch. This is what React Query does, and it's a good way to appreciate it after writing this by hand
- **Infinite scroll** using `IntersectionObserver` instead of the Load more button
- **Sort and year filters** on discover (`sort_by`, `primary_release_year`)
- **"Where to watch"** using `/movie/{id}/watch/providers`
- **Similar movies** on the detail page (`append_to_response=recommendations`)
- **Route-level code splitting** with `React.lazy`
- **A manual theme toggle** that overrides the system setting

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
