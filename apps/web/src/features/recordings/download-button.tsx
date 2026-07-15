import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { logger } from '@/lib/logger'

export function DownloadButton({
  filePath,
  streamName,
}: {
  streamName: string
  filePath: string
}) {
  const t = useTranslations('Recordings.recordingCard')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDownload = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/media/recordings/${encodeURIComponent(streamName)}/${encodeURIComponent(filePath)}?download`,
      )
      if (!response.ok || !response.body)
        throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)

      const total = Number(response.headers.get('Content-Length')) || 0
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break
        chunks.push(value)
        received += value.length
        if (total > 0)
          setProgress((received / total) * 100)
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'video.mp4'
      a.click()
      URL.revokeObjectURL(url)
    }
    catch (error) {
      logger.error('Error downloading video', error)
      toast.error(t('downloadError'))
    }
    setProgress(0)
    setLoading(false)
  }

  return (
    <Button
      disabled={loading}
      className="w-full"
      variant="outline"
      size="sm"
      aria-label={t('downloadAria', { filePath })}
      onClick={handleDownload}
    >
      {loading
        ? (
            <Progress value={progress} className="w-full" />
          )
        : (
            <Download className="w-4 h-4"></Download>
          )}
    </Button>
  )
}
