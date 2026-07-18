import { Pause, Play } from 'lucide-react'
import { Slider } from 'radix-ui'
import { useRef, useState } from 'react'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds))
    return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Custom seekbar per board 2c: 3px track, blue fill, white knob.
export function RecordingPlayer({ src }: { src: string }) {
  const t = useTranslations('Recordings.player')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video)
      return
    if (video.paused)
      video.play()
    else
      video.pause()
  }

  const seek = ([value]: number[]) => {
    const video = videoRef.current
    if (!video || value === undefined)
      return
    video.currentTime = value
    setCurrentTime(value)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-md bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        src={src}
        className="aspect-video w-full object-contain"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
      />
      <div className="flex items-center gap-3 px-2.5 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-white hover:bg-white/10 hover:text-white"
          onClick={togglePlay}
          aria-label={playing ? t('pause') : t('play')}
        >
          {playing
            ? <Pause aria-hidden className="size-3.5 fill-current" />
            : <Play aria-hidden className="size-3.5 fill-current" />}
        </Button>
        <span className="font-mono text-[10.5px] tabular-nums text-white/70">
          {formatClock(currentTime)}
        </span>
        <Slider.Root
          value={[currentTime]}
          max={Math.max(duration, 0.01)}
          step={0.1}
          onValueChange={seek}
          aria-label={t('seek')}
          className="relative flex h-4 flex-1 cursor-pointer touch-none select-none items-center"
        >
          <Slider.Track className="relative h-0.75 flex-1 rounded-full bg-white/15">
            <Slider.Range className="absolute h-full rounded-full bg-link" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-full bg-white shadow focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" />
        </Slider.Root>
        <span className="font-mono text-[10.5px] tabular-nums text-white/70">
          {formatClock(duration)}
        </span>
      </div>
    </div>
  )
}
