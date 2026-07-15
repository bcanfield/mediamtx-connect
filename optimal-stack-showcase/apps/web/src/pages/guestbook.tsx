import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { orpc } from '../orpc'

export function GuestbookPage() {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const entries = useQuery(orpc.entries.list.queryOptions())
  const addEntry = useMutation(
    orpc.entries.add.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.entries.list.key() })
        setMessage('')
      },
    }),
  )

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (message.trim())
      addEntry.mutate({ message })
  }

  return (
    <main>
      <h1>Guestbook</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder="Say something"
          maxLength={280}
        />
        <button type="submit" disabled={addEntry.isPending}>
          Sign
        </button>
      </form>
      {entries.isPending && <p>Loading…</p>}
      {entries.isError && <p>Failed to load entries.</p>}
      <ul>
        {entries.data?.map(entry => (
          <li key={entry.id}>
            {entry.message}
            {' '}
            <small>
              (
              {entry.createdAt.toLocaleTimeString()}
              )
            </small>
          </li>
        ))}
      </ul>
    </main>
  )
}
