'use client'

import type { Path } from '@/lib/MediaMTX/generated'
import { useSearchParams } from 'next/navigation'

import { useMemo } from 'react'
import { GridLayout } from '@/shared/components/layout'

import { StreamCard } from './StreamCard'
import { StreamFilters } from './StreamFilters'

interface StreamsGridProps {
  streams: Path[]
  hlsAddress?: string
  remoteMediaMtxUrl: string
}

export function StreamsGrid({
  streams,
  hlsAddress,
  remoteMediaMtxUrl,
}: StreamsGridProps) {
  const searchParams = useSearchParams()

  // Get filter values from URL
  const searchQuery = searchParams?.get('streamSearch') || ''
  const statusFilter = searchParams?.get('streamStatus') || 'all'

  // Filter streams based on search and status
  const filteredStreams = useMemo(() => {
    // First filter out any streams without a name
    return streams.filter((stream): stream is Path & { name: string } => {
      // Stream must have a name to be displayed
      if (!stream.name)
        return false

      // Search filter - match by name (case-insensitive)
      const matchesSearch = searchQuery === ''
        || stream.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      let matchesStatus = true
      if (statusFilter === 'online') {
        // Online = has a readyTime (stream is ready/active)
        matchesStatus = stream.readyTime !== null && stream.readyTime !== undefined
      }
      else if (statusFilter === 'offline') {
        // Offline = no readyTime (stream is waiting/not ready)
        matchesStatus = stream.readyTime === null || stream.readyTime === undefined
      }

      return matchesSearch && matchesStatus
    })
  }, [streams, searchQuery, statusFilter])

  // Count total valid streams (those with names)
  const validStreamsCount = streams.filter(s => s.name).length

  return (
    <div>
      <StreamFilters
        totalCount={validStreamsCount}
        filteredCount={filteredStreams.length}
      />

      {filteredStreams.length > 0
        ? (
            <GridLayout columnLayout="small">
              {filteredStreams.map(({ name, readyTime }) => (
                <StreamCard
                  key={name}
                  props={{
                    streamName: name,
                    readyTime,
                    hlsAddress,
                    remoteMediaMtxUrl,
                  }}
                />
              ))}
            </GridLayout>
          )
        : (
            <div
              className="text-center py-8 text-muted-foreground"
              data-testid="no-streams-found"
            >
              {searchQuery || statusFilter !== 'all'
                ? (
                    <p>No streams match your filters. Try adjusting your search criteria.</p>
                  )
                : (
                    <p>No streams available.</p>
                  )}
            </div>
          )}
    </div>
  )
}
