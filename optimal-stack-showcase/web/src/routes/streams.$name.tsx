import { createFileRoute, Link } from '@tanstack/react-router'
import { $api } from '../lib/api/client'

export const Route = createFileRoute('/streams/$name')({
  component: StreamDetailPage,
})

function StreamDetailPage() {
  // Typed route param flows straight into the typed API path param
  const { name } = Route.useParams()
  const { data, error, isPending } = $api.useQuery('get', '/api/streams/{name}', {
    params: { path: { name } },
  })

  if (isPending) {
    return <p className="text-gray-500">Loading…</p>
  }
  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error.detail ?? error.title}</p>
        <Link to="/" className="text-sm underline">
          Back to streams
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{data.name}</h1>
      <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
        <dt className="text-gray-500">Source</dt>
        <dd className="font-mono">{data.source}</dd>
        <dt className="text-gray-500">Status</dt>
        <dd>{data.ready ? 'live' : 'offline'}</dd>
        <dt className="text-gray-500">Readers</dt>
        <dd>{data.readers}</dd>
      </dl>
      <Link to="/" className="text-sm underline">
        Back to streams
      </Link>
    </div>
  )
}
