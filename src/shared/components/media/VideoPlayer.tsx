'use client'

import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

import { logger } from '@/shared/utils'

export default function VideoPlayer({ props }: { props: { address: string } }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    logger.debug('useeffect')
    const create = (video: HTMLVideoElement) => {
      logger.debug('create')

      const hls = new Hls({
        maxLiveSyncPlaybackRate: 1.5,
      })

      hls.on(Hls.Events.ERROR, (evt, data) => {
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          logger.debug('recovering hls error')

          hls.recoverMediaError()
        }
        else if (data.fatal) {
          logger.debug('fatal hls error')

          hls.destroy()
          retryTimeoutRef.current = setTimeout(() => create(video), 2000)
        }
      })

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        logger.debug('media attached')
        hls.loadSource(props.address)
      })

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        logger.debug('manifest parsed')
        video.play()
      })

      hls.attachMedia(video)
      return hls
    }

    if (!videoRef.current || !props.address) {
      return
    }

    if (!Hls.isSupported()) {
      videoRef.current.src = props.address
      return
    }
    const hls = create(videoRef.current)
    return () => {
      logger.debug('hls destroy')
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      hls?.destroy()
    }
  }, [props.address])
  return (
    <video
      className="w-full"
      ref={videoRef}
      muted={true}
      autoPlay
      controls
      playsInline
    />
  )
}
