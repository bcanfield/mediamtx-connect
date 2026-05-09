import { FolderOpen } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'

export function RecordingsIndexEmpty() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No Recordings Found"
      description={(
        <>
          <p>
            No recordings have been saved yet. Recordings will appear here once
            MediaMTX starts recording streams.
          </p>
          <p className="mt-2">
            Make sure
            {' '}
            <code className="rounded bg-muted px-1">MTX_RECORD=yes</code>
            {' '}
            is set in your MediaMTX configuration.
          </p>
        </>
      )}
    />
  )
}
