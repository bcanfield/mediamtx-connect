import { useNavigate, useSearch } from '@tanstack/react-router'
import { CircleDashed, Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useFormatter, useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { RecordingPlayer } from './recording-player'
import { useRecordingDownload } from './use-recording-download'

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3)
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

function formatRate(bytesPerSec: number): string {
  return `${(bytesPerSec / 1024 ** 2).toFixed(1)} MB/s`
}

export function RecordingRow({
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
  const t = useTranslations('Recordings.row')
  const format = useFormatter()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { play?: string }
  const [thumbnailError, setThumbnailError] = useState(false)

  const playing = search.play?.split(',').filter(Boolean) ?? []
  const isOpen = playing.includes(fileName)

  const download = useRecordingDownload(streamName, fileName, {
    onComplete: () => toast.success(t('downloadComplete')),
    onError: () => toast.error(t('downloadFailed')),
  })

  const togglePlay = () => {
    const updated = isOpen
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

  const time = format.dateTime(createdAt, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const mediaSrc = `/media/recordings/${encodeURIComponent(streamName)}/${encodeURIComponent(fileName)}`
  const showThumbnail = screenshotUrl && !thumbnailError

  return (
    <div
      data-testid="recording-row"
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-3 transition-colors',
        !isOpen && 'hover:border-border-hover',
      )}
    >
      {isOpen && <RecordingPlayer src={mediaSrc} />}

      <div className="flex items-center gap-4">
        {!isOpen && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={t('playAria', { time })}
            className="relative w-29.5 shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
          >
            <div className="aspect-video bg-black">
              {showThumbnail
                ? (
                    <img
                      alt=""
                      onError={() => setThumbnailError(true)}
                      src={screenshotUrl}
                      className="h-full w-full object-cover"
                    />
                  )
                : (
                    <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,#efefef_0_10px,#f5f5f5_10px_20px)] dark:bg-[repeating-linear-gradient(45deg,#101010_0_10px,#131313_10px_20px)]">
                      <CircleDashed className="size-4 text-faint" />
                    </div>
                  )}
            </div>
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium tabular-nums">{time}</p>
          {download.progress
            ? (
                <div className="mt-1.5 flex max-w-md flex-col gap-1.5">
                  <Progress
                    value={download.progress.totalBytes > 0
                      ? (download.progress.receivedBytes / download.progress.totalBytes) * 100
                      : 0}
                    className="h-0.75 [&>div]:bg-link"
                  />
                  <span aria-live="polite" className="font-mono text-[10.5px] text-mute">
                    {t('downloading', {
                      received: formatBytes(download.progress.receivedBytes),
                      total: formatBytes(download.progress.totalBytes),
                      rate: formatRate(download.progress.bytesPerSec),
                    })}
                  </span>
                </div>
              )
            : (
                <p className="truncate text-[11.5px] text-mute">
                  {formatBytes(fileSize)}
                </p>
              )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {download.downloading
            ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7.5 px-3"
                  onClick={download.cancel}
                >
                  {t('cancel')}
                </Button>
              )
            : (
                <>
                  <Button
                    type="button"
                    variant={isOpen ? 'default' : 'outline'}
                    size="sm"
                    className="h-7.5 px-3"
                    onClick={togglePlay}
                  >
                    {isOpen ? t('close') : t('play')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7.5"
                    aria-label={t('downloadAria', { file: fileName })}
                    onClick={download.start}
                  >
                    <Download className="size-3.5" />
                  </Button>
                </>
              )}
        </div>
      </div>
    </div>
  )
}
