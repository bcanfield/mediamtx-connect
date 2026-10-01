import type { RecordingSpan } from '@connect/contract'
import type { ReactNode } from 'react'
import type { ClipPreset, ClipRange } from './clip-range'
import dayjs from 'dayjs'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useFormatter, useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'

import { CLIP_PRESETS, clipFileName, clipRange } from './clip-range'
import { useRecordingDownload } from './use-recording-download'

const PRESET_LABELS = { 300: 'last5Min', 900: 'last15Min', 3600: 'last1Hour' } as const
const TIME = /^(\d{2}):(\d{2})(?::(\d{2}))?$/

// `time` is what <input type="time" step="1"> gives: HH:MM:SS, or HH:MM on
// browsers that drop zero seconds. Read on the selected browser-local day.
function customRange(day: Date, time: string, minutes: string): ClipRange | null {
  const match = TIME.exec(time)
  const whole = Number(minutes)
  if (!match || !Number.isInteger(whole) || whole < 1 || whole > 60)
    return null
  const [, hours, mins, secs = '0'] = match
  const start = dayjs(day).hour(Number(hours)).minute(Number(mins)).second(Number(secs)).toDate()
  return { start, duration: whole * 60 }
}

// A plain MP4 off MediaMTX's playback server, through the api's proxy: it
// stitches the range across segments without re-encoding.
function clipUrl(streamName: string, range: ClipRange): string {
  const query = new URLSearchParams({
    path: streamName,
    start: range.start.toISOString(),
    duration: String(range.duration),
    format: 'mp4',
  })
  return `/media/playback/get?${query}`
}

export function ClipDownload({ streamName, day, spans, selected }: {
  streamName: string
  day: Date
  /** At least one. */
  spans: RecordingSpan[]
  /** The span open in the player, if any. */
  selected: RecordingSpan | null
}) {
  const t = useTranslations('Recordings.clip')
  const format = useFormatter()
  const [choice, setChoice] = useState<ClipPreset | 'custom'>(300)
  // null until the user types, so the prefill follows the span in the player.
  const [startTime, setStartTime] = useState<string | null>(null)
  const [minutes, setMinutes] = useState('5')

  const defaultStart = dayjs((selected ?? spans.at(-1)!).start).format('HH:mm:ss')
  const range = choice === 'custom'
    ? customRange(day, startTime ?? defaultStart, minutes)
    : clipRange(spans, choice)

  const download = useRecordingDownload(
    range ? clipUrl(streamName, range) : '',
    range ? clipFileName(streamName, range.start) : '',
    {
      onComplete: () => toast.success(t('complete')),
      onError: status => toast.error(status === 404 ? t('noRecordings') : t('failed')),
    },
  )

  const clock = (d: Date) => format.dateTime(d, { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  function status(): string {
    if (download.progress) {
      return download.progress.receivedBytes === 0
        ? t('preparing')
        : t('progress', {
            received: formatBytes(format, download.progress.receivedBytes),
            rate: formatBytes(format, download.progress.bytesPerSec),
          })
    }
    return range
      ? t('range', { start: clock(range.start), end: clock(new Date(range.start.getTime() + range.duration * 1000)) })
      : ''
  }

  return (
    <section aria-label={t('title')} className="flex flex-col gap-2 border-t pt-3">
      <p className="text-meta font-medium">{t('title')}</p>
      <fieldset disabled={download.downloading} className="flex flex-col gap-2">
        <div role="group" aria-label={t('rangeAria')} className="flex flex-wrap gap-1.5">
          {CLIP_PRESETS.map(preset => (
            <ChoiceButton key={preset} pressed={choice === preset} onClick={() => setChoice(preset)}>
              {t(PRESET_LABELS[preset])}
            </ChoiceButton>
          ))}
          <ChoiceButton pressed={choice === 'custom'} onClick={() => setChoice('custom')}>
            {t('custom')}
          </ChoiceButton>
        </div>
        {choice === 'custom' && (
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="clip-start" className="text-label text-mute">{t('start')}</Label>
              <Input
                id="clip-start"
                type="time"
                step={1}
                required
                className="w-36 font-mono tabular-nums"
                value={startTime ?? defaultStart}
                onChange={event => setStartTime(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="clip-minutes" className="text-label text-mute">{t('durationMinutes')}</Label>
              <Input
                id="clip-minutes"
                type="number"
                min={1}
                max={60}
                step={1}
                required
                className="w-24 font-mono tabular-nums"
                value={minutes}
                onChange={event => setMinutes(event.target.value)}
              />
            </div>
          </div>
        )}
      </fieldset>
      <div className="flex items-center justify-between gap-3">
        <span aria-live="polite" className="font-mono text-label text-mute tabular-nums">{status()}</span>
        {download.downloading
          ? (
              <Button type="button" variant="outline" size="sm" className="h-7.5 px-3" onClick={download.cancel}>
                {t('cancel')}
              </Button>
            )
          : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7.5 px-3"
                disabled={!range}
                onClick={download.start}
              >
                <Download className="size-3.5" />
                {t('download')}
              </Button>
            )}
      </div>
    </section>
  )
}

function ChoiceButton({ pressed, onClick, children }: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={pressed}
      className={cn('h-7 px-2.5 text-meta', pressed && 'bg-accent text-foreground')}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
