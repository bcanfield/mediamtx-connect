'use client'

import axios from 'axios'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

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
      const response = await axios({
        method: 'get',
        url: `/api/${streamName}/${filePath}/download-recording`,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const progress = progressEvent.progress
          if (progress) {
            setProgress(progress * 100)
          }
        },
      })

      if (response.status === 200) {
        const blob = await response.data
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'video.mp4'
        a.click()
        URL.revokeObjectURL(url)
      }
      else {
        logger.error(
          `Failed to download video: ${response.status} ${response.statusText}`,
        )
        toast.error(t('downloadError'))
      }
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
