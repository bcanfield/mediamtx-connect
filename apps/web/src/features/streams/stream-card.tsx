import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Film,
  Image as ImageIcon,
  MoreVertical,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useFormatter, useTranslations } from 'use-intl'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VideoPlayer } from '@/components/video-player'
import { Link } from '@/i18n/navigation'

export function StreamCard({
  streamName,
  readyTime,
  hlsAddress,
  remoteMediaMtxUrl,
}: {
  streamName: string
  readyTime?: string | null
  hlsAddress?: string
  remoteMediaMtxUrl: string
}) {
  const t = useTranslations('Streams.card')
  const format = useFormatter()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { play?: string }
  const [thumbnailError, setThumbnailError] = useState(false)

  const playing = search.play?.split(',').filter(Boolean) ?? []
  const isLive = playing.includes(streamName)

  const togglePlay = () => {
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

  return (
    <Card data-testid="stream-card" className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">{streamName}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {readyTime
              ? t('onlineSince', { date: format.dateTime(new Date(readyTime), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) })
              : t('idle')}
          </p>
        </div>
        {isLive && (
          <Badge variant="destructive" className="shrink-0">
            <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-destructive-foreground" />
            {t('live')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-0 py-0">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {isLive
            ? (
                <VideoPlayer
                  props={{
                    address: `${remoteMediaMtxUrl}${hlsAddress}/${streamName}/index.m3u8`,
                  }}
                />
              )
            : thumbnailError
              ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="size-12 text-muted-foreground" />
                  </div>
                )
              : (
                  <img
                    alt=""
                    onError={() => setThumbnailError(true)}
                    src={`/media/screenshots/${encodeURIComponent(streamName)}/latest`}
                    className="h-full w-full object-cover"
                  />
                )}
        </AspectRatio>
      </CardContent>

      <CardFooter className="gap-2 pt-3">
        <Button
          variant={isLive ? 'secondary' : 'default'}
          size="sm"
          className="flex-1"
          onClick={togglePlay}
        >
          {isLive
            ? (
                <>
                  <PauseCircle className="mr-2 size-4" />
                  {t('stop')}
                </>
              )
            : (
                <>
                  <PlayCircle className="mr-2 size-4" />
                  {t('play')}
                </>
              )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t('actionsAria')}>
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="truncate">{streamName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/recordings/${streamName}`}>
                <Film className="mr-2 size-4" />
                {t('viewRecordings')}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
