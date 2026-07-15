import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Image as ImageIcon,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useFormatter, useTranslations } from 'use-intl'

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

export function RecordingCard({
  streamName,
  fileName,
  screenshotUrl,
  createdAt,
  fileSize,
}: {
  streamName: string
  fileName: string
  screenshotUrl?: string | null
  createdAt: Date
  fileSize: number
}) {
  const t = useTranslations('Recordings.recordingCard')
  const format = useFormatter()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { play?: string }
  const [thumbnailError, setThumbnailError] = useState(false)

  const playing = search.play?.split(',').filter(Boolean) ?? []
  const isPlaying = playing.includes(fileName)

  const togglePlay = () => {
    const updated = isPlaying
      ? playing.filter(s => s !== fileName)
      : [...playing, fileName]

    navigate({
      to: '.',
      search: prev => ({
        ...prev,
        play: updated.length > 0 ? updated.join(',') : undefined,
      }),
      resetScroll: false,
    })
  }

  const sizeMb = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
  const showThumbnail = !isPlaying && screenshotUrl && !thumbnailError

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
                  src={`/media/recordings/${encodeURIComponent(streamName)}/${encodeURIComponent(fileName)}`}
                />
              )
            : showThumbnail
              ? (
                  <img
                    alt=""
                    onError={() => setThumbnailError(true)}
                    src={screenshotUrl}
                    className="h-full w-full object-cover"
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
