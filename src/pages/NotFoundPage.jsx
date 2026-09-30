import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="px-4 py-16">
      <EmptyState eyebrow="Error 404" title="This reel isn’t in the archive">
        <Link to="/" className="font-mono text-sm text-accent underline underline-offset-4">
          Back to Discover
        </Link>
      </EmptyState>
    </div>
  )
}
