import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

export function VideoPlayer({ address, className }: { address: string, className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !address)
      return

    if (!Hls.isSupported()) {
      video.src = address
      return
    }

    const create = () => {
      const hls = new Hls({
        maxLiveSyncPlaybackRate: 1.5,
      })
      hlsRef.current = hls

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError()
        }
        else if (data.fatal) {
          logger.error('fatal hls error, retrying in 2s', { address, details: data.details })
          hls.destroy()
          retryTimeoutRef.current = setTimeout(create, 2000)
        }
      })

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(address)
      })

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play()
      })

      hls.attachMedia(video)
    }

    create()

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [address])

  return (
    <video
      className={cn('size-full bg-black object-contain', className)}
      ref={videoRef}
      muted
      autoPlay
      playsInline
    />
  )
}
