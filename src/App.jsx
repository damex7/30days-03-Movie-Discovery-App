import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorState from './components/ErrorState'
import { GridSkeleton } from './components/Skeletons'
import { useFetch } from './hooks/useFetch'
import { getTrending } from './lib/tmdb'

// Temporary page to exercise useFetch + the three states; replaced in the next step.
function Smoke() {
  const { status, data, error, retry } = useFetch((signal) => getTrending({ signal }), [])
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {status === 'loading' && <GridSkeleton />}
      {status === 'error' && <ErrorState error={error} onRetry={retry} />}
      {status === 'success' && <p>{data.results.length} trending movies</p>}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="*" element={<Smoke />} />
      </Route>
    </Routes>
  )
}
