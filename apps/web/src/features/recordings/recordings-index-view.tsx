import type { RecordingStreamSummary } from '@connect/contract'
import { ArrowRight, CircleDashed, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormatter, useNow, useTranslations } from 'use-intl'

import { mediaCardShell } from '@/components/media-card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function RecordingsIndexView({ streams }: { streams: RecordingStreamSummary[] }) {
  const t = useTranslations('Recordings')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey)
        return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q)
      return streams
    return streams.filter(s => s.name.toLowerCase().includes(q))
  }, [query, streams])

  const totalRecordings = streams.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {t('toolbar.summary', { streams: streams.length, recordings: totalRecordings })}
        </p>

        <div className="relative w-full sm:w-70">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t('toolbar.filterPlaceholder')}
            aria-label={t('toolbar.filterAria')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-[10px] text-mute"
          >
            /
          </kbd>
        </div>
      </div>

      {filtered.length === 0
        ? (
            <div className="mx-auto my-14 w-full max-w-md rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
                {t('empty.noMatchingTitle')}
              </h2>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {t('empty.noMatchingDescription', { query })}
              </p>
            </div>
          )
        : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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
  const now = useNow()
  const [thumbnailError, setThumbnailError] = useState(false)
  const showThumbnail = stream.screenshotUrl && !thumbnailError

  return (
    <Link
      href={`/recordings/${stream.name}`}
      aria-label={t('openAria', { name: stream.name })}
      data-testid="stream-summary-card"
      className={cn(mediaCardShell, 'group focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20')}
    >
      <AspectRatio ratio={16 / 9} className="relative overflow-hidden bg-black">
        {showThumbnail
          ? (
              <img
                alt=""
                onError={() => setThumbnailError(true)}
                src={stream.screenshotUrl!}
                className="size-full object-cover"
              />
            )
          : (
              <div className="flex size-full items-center justify-center bg-hatch">
                <CircleDashed className="size-6 text-faint" />
              </div>
            )}

        {stream.latestMtime && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[10px] text-white/80">
            {format.dateTime(stream.latestMtime, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        )}

        <span className="absolute bottom-2.5 left-2.5 rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-white/80">
          {t('recordingsChip', { count: stream.count })}
        </span>
      </AspectRatio>

      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium">{stream.name}</p>
          {stream.latestMtime && (
            <p className="truncate text-[11.5px] text-mute">
              {t('latest', { time: format.relativeTime(stream.latestMtime, now) })}
            </p>
          )}
        </div>
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 text-faint transition-colors group-hover:text-foreground"
        />
      </div>
    </Link>
  )
}
