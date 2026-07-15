import type { RecordingStreamSummary } from '@connect/contract'
import { FolderOpen, Image as ImageIcon, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFormatter, useTranslations } from 'use-intl'

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
import { Link } from '@/i18n/navigation'

export function RecordingsIndexView({ streams }: { streams: RecordingStreamSummary[] }) {
  const t = useTranslations('Recordings')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q)
      return streams
    return streams.filter(s => s.name.toLowerCase().includes(q))
  }, [query, streams])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0
        ? (
            <EmptyState
              icon={FolderOpen}
              title={t('empty.noMatchingTitle')}
              description={t('empty.noMatchingDescription', { query })}
            />
          )
        : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(stream => (
                <StreamSummaryCard key={stream.name} stream={stream} />
              ))}
            </div>
          )}
    </div>
  )
}

function StreamSummaryCard({ stream }: { stream: RecordingStreamSummary }) {
  const t = useTranslations('Recordings.card')
  const format = useFormatter()
  const [thumbnailError, setThumbnailError] = useState(false)
  const latest = stream.latestMtime ? format.relativeTime(stream.latestMtime) : null
  const showThumbnail = stream.screenshotUrl && !thumbnailError

  return (
    <Card data-testid="stream-summary-card" className="flex flex-col overflow-hidden">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        {showThumbnail
          ? (
              <img
                alt=""
                onError={() => setThumbnailError(true)}
                src={stream.screenshotUrl!}
                className="h-full w-full object-cover"
              />
            )
          : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="size-10 text-muted-foreground" />
              </div>
            )}
      </AspectRatio>

      <CardHeader className="pb-2">
        <CardTitle className="truncate text-base">{stream.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-3 text-sm text-muted-foreground">
        {t('recordingCount', { count: stream.count })}
        {latest && (
          <>
            {' · '}
            {t('latest', { time: latest })}
          </>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/recordings/${stream.name}`} className="w-full">
          <Button variant="outline" className="w-full">{t('viewBtn')}</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
