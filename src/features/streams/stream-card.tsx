'use client'

import {
  Film,
  Image as ImageIcon,
  MoreVertical,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

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

const PLAY_PARAM = 'play'

export function StreamCard({
  streamName,
  readyTime,
  hlsAddress,
  remoteMediaMtxUrl,
  priority = false,
}: {
  streamName: string
  readyTime?: string | null
  hlsAddress?: string
  remoteMediaMtxUrl: string
  priority?: boolean
}) {
  const t = useTranslations('Streams.card')
  const format = useFormatter()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [thumbnailError, setThumbnailError] = useState(false)

  const isLive = searchParams
    ?.get(PLAY_PARAM)
    ?.split(',')
    .filter(Boolean)
    .includes(streamName)
    ?? false

  const togglePlay = () => {
    const next = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : [])
    const current = next.get(PLAY_PARAM)?.split(',').filter(Boolean) ?? []
    const updated = current.includes(streamName)
      ? current.filter(s => s !== streamName)
      : [...current, streamName]

    if (updated.length > 0)
      next.set(PLAY_PARAM, updated.join(','))
    else
      next.delete(PLAY_PARAM)

    const search = next.toString()
    router.push(`${pathname}${search ? `?${search}` : ''}`, { scroll: false })
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
                  <Image
                    alt=""
                    fill
                    priority={priority}
                    onError={() => setThumbnailError(true)}
                    src={`/api/${streamName}/first-screenshot`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
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
