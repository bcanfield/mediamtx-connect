import type { PlaybackMode, PlaybackProtocol } from '@/lib/playback'

import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

import { logger } from '@/lib/logger'
import { resolveTransport } from '@/lib/playback'
import { cn } from '@/lib/utils'
import { closeWhepSession, negotiateWhep, waitForConnected } from '@/lib/whep'

export interface VideoPlayerProps {
  hlsUrl: string
  /** Null when the server serves no WebRTC address — then HLS is the only option. */
  whepUrl?: string | null
  mode: PlaybackMode
  /** From MediaMTX's own `webrtcICEServers2`. Must be referentially stable — the effect keys on it. */
  iceServers?: RTCIceServer[]
  /** Reports the transport actually playing; null while a transport is still being established. */
  onProtocolChange?: (protocol: PlaybackProtocol | null) => void
  className?: string
}

export function VideoPlayer({
  hlsUrl,
  whepUrl = null,
  mode,
  iceServers,
  onProtocolChange,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  // Kept in a ref so a new callback identity each render doesn't tear the
  // player down and renegotiate.
  const reportRef = useRef(onProtocolChange)
  reportRef.current = onProtocolChange

  useEffect(() => {
    const video = videoRef.current
    if (!video || !hlsUrl)
      return

    let disposed = false
    let hls: Hls | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let pc: RTCPeerConnection | null = null
    let whepResource: string | null = null
    const teardown = new AbortController()

    const startHls = () => {
      reportRef.current?.('hls')

      if (!Hls.isSupported()) {
        video.src = hlsUrl
        return
      }

      const create = () => {
        const instance = new Hls({ maxLiveSyncPlaybackRate: 1.5 })
        hls = instance

        instance.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            instance.recoverMediaError()
          }
          else if (data.fatal) {
            logger.error('fatal hls error, retrying in 2s', { hlsUrl, details: data.details })
            instance.destroy()
            retryTimer = setTimeout(create, 2000)
          }
        })

        instance.on(Hls.Events.MEDIA_ATTACHED, () => instance.loadSource(hlsUrl))
        instance.on(Hls.Events.MANIFEST_PARSED, () => video.play())
        instance.attachMedia(video)
      }

      create()
    }

    // Fired at most once, whether WebRTC fails to connect or drops mid-stream:
    // a playing stream beats a black card, so give up on WebRTC and play HLS.
    let fellBack = false
    const fallBackToHls = async (reason: string, error?: unknown) => {
      if (fellBack || disposed)
        return
      fellBack = true
      logger.warn(reason, { whepUrl, error })
      if (pc) {
        await closeWhepSession(pc, whepResource)
        pc = null
        whepResource = null
      }
      video.srcObject = null
      if (!disposed)
        startHls()
    }

    const startWebrtc = async (url: string) => {
      const connection = new RTCPeerConnection({ iceServers })
      pc = connection
      connection.ontrack = (event) => {
        video.srcObject = event.streams[0] ?? null
      }
      // recvonly: this is playback, we never publish from the browser
      connection.addTransceiver('video', { direction: 'recvonly' })
      connection.addTransceiver('audio', { direction: 'recvonly' })

      whepResource = await negotiateWhep(connection, url)
      await waitForConnected(connection)
      if (disposed)
        return

      // Connected — but a later route change or blip can still drop it. Without
      // this, only connect-time failure falls back and a mid-stream drop freezes
      // the card. `closed` is excluded: that's our own teardown firing.
      connection.addEventListener('connectionstatechange', () => {
        if (connection.connectionState === 'failed' && pc === connection)
          void fallBackToHls('webrtc dropped mid-stream, falling back to hls')
      }, { signal: teardown.signal })

      reportRef.current?.('webrtc')
      video.play()
    }

    const start = async () => {
      reportRef.current?.(null)

      if (!whepUrl || resolveTransport(mode, whepUrl) === 'hls') {
        startHls()
        return
      }

      try {
        await startWebrtc(whepUrl)
      }
      catch (error) {
        // Blocked UDP, no route to the WebRTC port, webrtc off server-side —
        // all of it lands here, and all of it means: play the stream anyway.
        await fallBackToHls('webrtc playback unavailable, falling back to hls', error)
      }
    }

    start()

    return () => {
      disposed = true
      teardown.abort()
      if (retryTimer)
        clearTimeout(retryTimer)
      hls?.destroy()
      hls = null
      if (pc)
        closeWhepSession(pc, whepResource)
      video.srcObject = null
    }
  }, [hlsUrl, whepUrl, mode, iceServers])

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
