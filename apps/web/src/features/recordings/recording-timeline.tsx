import type { RecordingSpan } from '@connect/contract'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useFormatter, useTranslations } from 'use-intl'

import { StatusPanel } from '@/components/status-panel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { orpc } from '@/orpc'

import { PlaybackEnableCard } from './playback-enable-card'
import { RecordingPlayer } from './recording-player'

const DAY_FORMAT = 'YYYY-MM-DD'
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TRACK_HOURS = [0, 6, 12, 18, 24]

// What a span plays from: the api's proxy of MediaMTX's /get, never the
// playback server itself (unpublished port, CORS, credentials).
function playbackUrl(streamName: string, span: RecordingSpan): string {
  const query = new URLSearchParams({
    path: streamName,
    start: span.start.toISOString(),
    duration: String(span.duration),
  })
  return `/media/playback/get?${query}`
}

// The day shown is `?day=YYYY-MM-DD`, read as a browser-local day; today when
// absent. /list clips spans to the bounds it's given, so local midnight to
// local midnight returns spans already cut to the day.
export function RecordingTimelineSection({ streamName }: { streamName: string }) {
  const t = useTranslations('Recordings.timeline')
  const queryClient = useQueryClient()
  const search = useSearch({ strict: false }) as { day?: string }
  // dayjs reads a bare date as local midnight, unlike `new Date()`.
  const day = search.day && DAY_PATTERN.test(search.day) && dayjs(search.day).isValid()
    ? dayjs(search.day)
    : dayjs().startOf('day')

  const input = { streamName, start: day.toDate(), end: day.add(1, 'day').toDate() }
  const timeline = useQuery(orpc.recordings.timeline.queryOptions({ input }))

  // MediaMTX restarts its API listener on a global config write, so the first
  // reads after the card's write can fail or find it unreachable. Retry them
  // for a few seconds: a retrying query keeps its last data, so the card stays
  // up as "applying" instead of the error panel flashing.
  async function refetchAfterEnable() {
    const options = orpc.recordings.timeline.queryOptions({ input })
    try {
      await queryClient.fetchQuery({
        ...options,
        queryFn: async (context) => {
          const result = await options.queryFn!(context)
          if (result === null)
            throw new Error('MediaMTX API unreachable')
          return result
        },
        retry: 5,
        retryDelay: 1000,
      })
    }
    catch {
      await queryClient.invalidateQueries({ queryKey: options.queryKey })
    }
    // After, not before: the card computes its change list from path defaults,
    // and would redraw it mid-apply.
    await queryClient.invalidateQueries({ queryKey: orpc.config.mediamtx.key() })
  }

  if (timeline.isError) {
    return (
      <StatusPanel
        tone="error"
        layout="banner"
        title={t('errorTitle')}
        description={timeline.error.message}
      />
    )
  }

  if (!timeline.isSuccess)
    return null

  if (timeline.data === null) {
    return (
      <StatusPanel
        tone="warning"
        layout="banner"
        title={t('unreachableTitle')}
        description={t('unreachableDescription')}
      />
    )
  }

  if (timeline.data.status === 'unavailable') {
    return (
      <PlaybackEnableCard
        streamName={streamName}
        playbackEnabled={timeline.data.playbackEnabled}
        recordFormat={timeline.data.recordFormat}
        onEnabled={refetchAfterEnable}
      />
    )
  }

  return (
    <DayTimeline
      key={day.format(DAY_FORMAT)}
      streamName={streamName}
      day={day.toDate()}
      spans={timeline.data.spans}
    />
  )
}

function DayTimeline({ streamName, day, spans }: { streamName: string, day: Date, spans: RecordingSpan[] }) {
  const t = useTranslations('Recordings.timeline')
  const format = useFormatter()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<RecordingSpan | null>(null)

  const dayStart = day.getTime()
  // Not 24 h on a daylight-saving changeover.
  const dayLength = dayjs(day).add(1, 'day').valueOf() - dayStart

  const goToDay = (offset: number) => {
    navigate({
      to: '.',
      search: prev => ({ ...prev, day: dayjs(day).add(offset, 'day').format(DAY_FORMAT) }),
      resetScroll: false,
    })
  }

  const clock = (d: Date) => format.dateTime(d, { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  function describe(span: RecordingSpan): string {
    const end = new Date(span.start.getTime() + span.duration * 1000)
    return t('span', { start: clock(span.start), end: clock(end), duration: formatDuration(span.duration) })
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const unit = (value: number, unit: 'hour' | 'minute' | 'second') =>
      format.number(value, { style: 'unit', unit, unitDisplay: 'short' })
    if (hours > 0 && minutes > 0)
      return t('durationParts', { hours: unit(hours, 'hour'), minutes: unit(minutes, 'minute') })
    if (hours > 0)
      return unit(hours, 'hour')
    if (minutes > 0)
      return unit(minutes, 'minute')
    return unit(Math.round(seconds), 'second')
  }

  const toggle = (span: RecordingSpan) =>
    setSelected(current => (current === span ? null : span))

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t('previousDay')}
          onClick={() => goToDay(-1)}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <p className="text-body font-medium">
          {format.dateTime(day, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t('nextDay')}
          onClick={() => goToDay(1)}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <div>
        <div
          role="group"
          aria-label={t('trackAria')}
          className="relative h-6 overflow-hidden rounded-md bg-hatch"
        >
          {spans.map(span => (
            <button
              key={span.start.toISOString()}
              type="button"
              aria-label={t('playSpanAria', { span: describe(span) })}
              onClick={() => toggle(span)}
              style={{
                left: `${((span.start.getTime() - dayStart) / dayLength) * 100}%`,
                width: `${((span.duration * 1000) / dayLength) * 100}%`,
              }}
              className={cn(
                'absolute inset-y-0 min-w-0.5 bg-link/70 hover:bg-link focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                selected === span && 'bg-link',
              )}
            />
          ))}
        </div>
        <div aria-hidden className="mt-1 flex justify-between font-mono text-label text-faint">
          {TRACK_HOURS.map(hour => <span key={hour}>{String(hour).padStart(2, '0')}</span>)}
        </div>
      </div>

      {selected && (
        <RecordingPlayer
          key={selected.start.toISOString()}
          src={playbackUrl(streamName, selected)}
          fallbackDuration={selected.duration}
        />
      )}

      {spans.length === 0
        ? <p className="text-meta text-mute">{t('empty')}</p>
        : (
            <ul aria-label={t('spansAria')} className="flex flex-col gap-1">
              {spans.map(span => (
                <li key={span.start.toISOString()}>
                  <button
                    type="button"
                    onClick={() => toggle(span)}
                    aria-pressed={selected === span}
                    className={cn(
                      'w-full rounded-md px-2 py-1 text-left font-mono text-meta tabular-nums transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20',
                      selected === span && 'bg-accent text-foreground',
                    )}
                  >
                    {describe(span)}
                  </button>
                </li>
              ))}
            </ul>
          )}
    </section>
  )
}
