import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { $api } from '../lib/api/client'

export const Route = createFileRoute('/')({
  component: StreamsPage,
})

function StreamsPage() {
  const { data, error, isPending } = $api.useQuery('get', '/api/streams')

  if (isPending) {
    return <p className="text-gray-500">Loading…</p>
  }
  if (error) {
    return (
      <p className="text-red-600">
        Failed to load streams:
        {' '}
        {error.detail ?? error.title}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <ul className="space-y-2">
        {data.streams.map(stream => (
          <li
            key={stream.name}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
          >
            <Link
              to="/streams/$name"
              params={{ name: stream.name }}
              className="font-medium hover:underline"
            >
              {stream.name}
            </Link>
            <span
              className={
                stream.ready
                  ? 'rounded bg-green-100 px-2 py-0.5 text-xs text-green-800'
                  : 'rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500'
              }
            >
              {stream.ready ? 'live' : 'offline'}
            </span>
            <span className="ml-auto text-sm text-gray-500">
              {stream.readers}
              {' '}
              readers
            </span>
          </li>
        ))}
      </ul>
      <CreateStreamForm />
    </div>
  )
}

function CreateStreamForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [source, setSource] = useState('')

  const createStream = $api.useMutation('post', '/api/streams', {
    onSuccess: async () => {
      setName('')
      setSource('')
      await queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/streams').queryKey,
      })
    },
  })

  return (
    <form
      className="space-y-3 rounded-lg border border-gray-200 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        createStream.mutate({ body: { name, source } })
      }}
    >
      <h2 className="font-semibold">Add a stream</h2>
      <input
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
        placeholder="porch-cam"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
        placeholder="rtsp://camera.local:554/stream3"
        value={source}
        onChange={e => setSource(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={createStream.isPending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {createStream.isPending ? 'Creating…' : 'Create'}
      </button>
      {createStream.error && (
        <p className="text-sm text-red-600">
          {createStream.error.detail ?? createStream.error.title}
        </p>
      )}
    </form>
  )
}
