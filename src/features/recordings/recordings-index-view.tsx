'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { FolderOpen, Image as ImageIcon, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

dayjs.extend(relativeTime)

interface StreamSummaryEntry {
  name: string
  count: number
  latestMtime: string | null
}

export function RecordingsIndexView({ streams }: { streams: StreamSummaryEntry[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q)
      return streams
    return streams.filter(s => s.name.toLowerCase().includes(q))
  }, [query, streams])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search streams"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0
        ? (
            <EmptyState
              icon={FolderOpen}
              title="No matching streams"
              description={`No streams match "${query}".`}
            />
          )
        : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(stream => (
                <StreamSummaryCard key={stream.name} stream={stream} />
              ))}
            </div>
          )}
    </div>
  )
}

function StreamSummaryCard({ stream }: { stream: StreamSummaryEntry }) {
  const [thumbnailError, setThumbnailError] = useState(false)
  const recordingsLabel = stream.count === 1 ? 'Recording' : 'Recordings'
  const latest = stream.latestMtime ? dayjs(stream.latestMtime).fromNow() : null

  return (
    <Card data-testid="stream-summary-card" className="flex flex-col overflow-hidden">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        {thumbnailError
          ? (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="size-10 text-muted-foreground" />
              </div>
            )
          : (
              <Image
                alt=""
                fill
                onError={() => setThumbnailError(true)}
                src={`/api/${stream.name}/first-screenshot`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            )}
      </AspectRatio>

      <CardHeader className="pb-2">
        <CardTitle className="truncate text-base">{stream.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-3 text-sm text-muted-foreground">
        {stream.count}
        {' '}
        {recordingsLabel}
        {latest && (
          <>
            {' · '}
            Latest
            {' '}
            {latest}
          </>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/recordings/${stream.name}`} className="w-full">
          <Button variant="outline" className="w-full">View</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
