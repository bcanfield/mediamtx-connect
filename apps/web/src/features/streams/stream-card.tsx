import { useNavigate, useSearch } from '@tanstack/react-router'
import { MoreHorizontal, Play } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useFormatter, useTranslations } from 'use-intl'

import { mediaCardShell } from '@/components/media-card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VideoPlayer } from '@/components/video-player'
import { Link } from '@/i18n/navigation'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

// Overlay-zone contract from the design handoff (board 1h): every optional
// prop adds a chip in its zone; nothing reflows. Codecs, telemetry, sharing
// and recording state aren't in the API yet — the zones render only when the
// data shows up.
export interface StreamCardProps {
  streamName: string
  readyTime?: string | null
  hlsAddress?: string
  remoteMediaMtxUrl: string
  playDisabled?: boolean
  codecs?: string[]
  resolution?: string
  bitrate?: string
  recording?: boolean
  viewers?: number
}

const overlayPill = 'inline-flex items-center rounded-full border bg-black/75 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.07em]'
const overlayPillLive = cn(overlayPill, 'gap-1.5 border-live/35 text-live-foreground')
const overlayPillNeutral = cn(overlayPill, 'border-white/15 text-white/90')

function formatUptime(readyTime: string): string {
  const totalMinutes = Math.max(0, Math.floor((Date.now() - new Date(readyTime).getTime()) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function StreamCard({
  streamName,
  readyTime,
  hlsAddress,
  remoteMediaMtxUrl,
  playDisabled = false,
  codecs = [],
  resolution,
  bitrate,
  recording = false,
  viewers,
}: StreamCardProps) {
  const t = useTranslations('Streams.card')
  const format = useFormatter()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { play?: string }
  const [thumbnailError, setThumbnailError] = useState(false)

  const playing = search.play?.split(',').filter(Boolean) ?? []
  const isLive = playing.includes(streamName)

  const togglePlay = () => {
    if (playDisabled)
      return
    const updated = isLive
      ? playing.filter(s => s !== streamName)
      : [...playing, streamName]

    navigate({
      to: '.',
      search: prev => ({
        ...prev,
        play: updated.length > 0 ? updated.join(',') : undefined,
      }),
      resetScroll: false,
    })
  }

  const stub = (action: string) => () => {
    logger.info(`stream action "${action}" is stubbed — not implemented yet`, {
      action,
      stream: streamName,
    })
    toast.info(t('stub.title'), { description: t('stub.description') })
  }

  const telemetry = [resolution, bitrate, viewers !== undefined ? t('viewers', { count: viewers }) : undefined]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      data-testid="stream-card"
      className={cn(mediaCardShell, playDisabled && 'opacity-75')}
    >
      <AspectRatio ratio={16 / 9} className="group relative overflow-hidden bg-black">
        {isLive
          ? (
              <VideoPlayer
                address={`${remoteMediaMtxUrl}${hlsAddress}/${streamName}/index.m3u8`}
              />
            )
          : thumbnailError
            ? (
                <div className="size-full bg-hatch">
                  <span className="absolute inset-x-0 bottom-3 px-4 text-center font-mono text-[10.5px] text-faint">
                    {t('noSnapshot')}
                  </span>
                </div>
              )
            : (
                <img
                  alt=""
                  onError={() => setThumbnailError(true)}
                  src={`/media/screenshots/${encodeURIComponent(streamName)}/latest`}
                  className="size-full object-cover"
                />
              )}

        {/* top-left: status pills */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          {isLive
            ? (
                <>
                  <span className={overlayPillLive}>
                    <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-live motion-reduce:animate-none" />
                    {t('live')}
                  </span>
                  <span className={overlayPillNeutral}>
                    {t('protocolHls')}
                  </span>
                </>
              )
            : !thumbnailError && (
                <span className={overlayPillNeutral}>
                  {t('snapshot')}
                </span>
              )}
        </div>

        {/* bottom scrim behind chips */}
        {(codecs.length > 0 || telemetry) && (
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/70 to-transparent" />
        )}

        {/* bottom-left: codec chips */}
        {codecs.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
            {codecs.map(codec => (
              <span
                key={codec}
                className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white/80"
              >
                {codec}
              </span>
            ))}
          </div>
        )}

        {/* bottom-right: telemetry */}
        {telemetry && (
          <span className="absolute bottom-2.5 right-2.5 font-mono text-[10.5px] text-white/70">
            {telemetry}
          </span>
        )}

        {/* idle: centered play affordance */}
        {!isLive && (
          <button
            type="button"
            onClick={togglePlay}
            disabled={playDisabled}
            aria-label={t('playAria', { streamName })}
            className="absolute left-1/2 top-1/2 flex size-11.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_12px_rgba(0,0,0,.4)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <Play aria-hidden className="ml-0.5 size-4 fill-current" />
          </button>
        )}
      </AspectRatio>

      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium">{streamName}</p>
          <p className="truncate text-[11.5px] text-mute">
            {readyTime
              ? t('onlineSince', {
                  time: format.dateTime(new Date(readyTime), { hour: '2-digit', minute: '2-digit' }),
                  uptime: formatUptime(readyTime),
                })
              : t('idle')}
            {recording && (
              <span className="whitespace-nowrap text-live-foreground">
                {' '}
                {t('recIndicator')}
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant={isLive ? 'default' : 'outline'}
            size="sm"
            className="h-7.5 px-3"
            onClick={togglePlay}
            disabled={playDisabled}
          >
            {isLive ? t('stop') : t('play')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7.5"
                aria-label={t('actionsAria')}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg">
              <DropdownMenuItem onClick={stub('open-stream-detail')}>
                {t('menu.openDetail')}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/recordings/${streamName}`}>{t('menu.viewRecordings')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stub('take-snapshot')}>
                {t('menu.takeSnapshot')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={stub('toggle-record')}>
                <span className="flex-1">{t('menu.record')}</span>
                <span className="font-mono text-[10px] uppercase text-faint">
                  {recording ? t('menu.recordOn') : t('menu.recordOff')}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stub('copy-publish-urls')}>
                {t('menu.copyPublishUrls')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stub('share-embed')}>
                {t('menu.shareEmbed')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/config/mediamtx/paths/${encodeURIComponent(streamName)}`}>
                  {t('menu.editPathConfig')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stub('edit-hooks')}>
                {t('menu.editHooks')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
