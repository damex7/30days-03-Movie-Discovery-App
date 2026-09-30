import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<p className="p-8 font-mono">Marquee: scaffold ready.</p>} />
    </Routes>
  )
}
