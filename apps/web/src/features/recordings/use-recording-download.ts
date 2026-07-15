import { useRef, useState } from 'react'

import { logger } from '@/lib/logger'

export interface DownloadProgress {
  receivedBytes: number
  totalBytes: number
  bytesPerSec: number
}

// Streams the MP4 through fetch so the row can render live progress
// (board 2c downloading state). Cancelable via AbortController.
export function useRecordingDownload(streamName: string, fileName: string, callbacks: {
  onComplete: () => void
  onError: () => void
}) {
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cancel = () => {
    abortRef.current?.abort()
  }

  const start = async () => {
    if (abortRef.current)
      return
    const controller = new AbortController()
    abortRef.current = controller
    const startedAt = performance.now()
    setProgress({ receivedBytes: 0, totalBytes: 0, bytesPerSec: 0 })

    try {
      const response = await fetch(
        `/media/recordings/${encodeURIComponent(streamName)}/${encodeURIComponent(fileName)}?download`,
        { signal: controller.signal },
      )
      if (!response.ok || !response.body)
        throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)

      const totalBytes = Number(response.headers.get('Content-Length')) || 0
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let receivedBytes = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break
        chunks.push(value)
        receivedBytes += value.length
        const elapsedSec = (performance.now() - startedAt) / 1000
        setProgress({
          receivedBytes,
          totalBytes,
          bytesPerSec: elapsedSec > 0 ? receivedBytes / elapsedSec : 0,
        })
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.endsWith('.mp4') ? fileName : `${fileName}.mp4`
      a.click()
      URL.revokeObjectURL(url)
      callbacks.onComplete()
    }
    catch (error) {
      if (!controller.signal.aborted) {
        logger.error('Error downloading video', error)
        callbacks.onError()
      }
    }
    abortRef.current = null
    setProgress(null)
  }

  return { progress, downloading: progress !== null, start, cancel }
}
