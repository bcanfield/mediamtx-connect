'use client'

import {
  Image as ImageIcon,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { DownloadButton } from './download-button'

const PLAY_PARAM = 'play'

export function RecordingCard({
  streamName,
  fileName,
  thumbnail,
  createdAt,
  fileSize,
}: {
  streamName: string
  fileName: string
  thumbnail?: string | null
  createdAt: Date
  fileSize: number
}) {
  const t = useTranslations('Recordings.recordingCard')
  const format = useFormatter()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [thumbnailError, setThumbnailError] = useState(false)

  const isPlaying = searchParams
    ?.get(PLAY_PARAM)
    ?.split(',')
    .filter(Boolean)
    .includes(fileName)
    ?? false

  const togglePlay = () => {
    const next = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : [])
    const current = next.get(PLAY_PARAM)?.split(',').filter(Boolean) ?? []
    const updated = current.includes(fileName)
      ? current.filter(s => s !== fileName)
      : [...current, fileName]

    if (updated.length > 0)
      next.set(PLAY_PARAM, updated.join(','))
    else
      next.delete(PLAY_PARAM)

    const search = next.toString()
    router.push(`${pathname}${search ? `?${search}` : ''}`, { scroll: false })
  }

  const sizeMb = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
  const showThumbnail = !isPlaying && thumbnail && !thumbnailError

  return (
    <Card data-testid="recording-card" className="flex flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="truncate font-mono text-sm">
          {format.dateTime(createdAt, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </CardTitle>
        <span className="shrink-0 text-xs text-muted-foreground">{sizeMb}</span>
      </CardHeader>

      <CardContent className="px-0 py-0">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {isPlaying
            ? (
                <video
                  className="h-full w-full"
                  autoPlay
                  controls
                  playsInline
                  src={`/api/${streamName}/${fileName}/view-recording`}
                />
              )
            : showThumbnail
              ? (
                  <Image
                    alt=""
                    fill
                    onError={() => setThumbnailError(true)}
                    src={thumbnail}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                )
              : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="size-10 text-muted-foreground" />
                  </div>
                )}
        </AspectRatio>
      </CardContent>

      <CardFooter className="gap-2 pt-3">
        <Button
          variant={isPlaying ? 'secondary' : 'default'}
          size="sm"
          className="flex-1"
          onClick={togglePlay}
        >
          {isPlaying
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
        <DownloadButton streamName={streamName} filePath={fileName} />
      </CardFooter>
    </Card>
  )
}
