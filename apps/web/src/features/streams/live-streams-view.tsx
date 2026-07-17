import type { Stream } from '@connect/contract'
import type { PlaybackMode } from '@/lib/playback'
import type { PublishTarget } from '@/lib/publish'

import { useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslations } from 'use-intl'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { isPlaybackMode, PLAYBACK_MODE_KEY, readPlaybackMode } from '@/lib/playback'
import { cn } from '@/lib/utils'

import { StreamCard } from './stream-card'

type Density = '2' | '3' | '4'
const DENSITY_KEY = 'liveDensity'
const DEFAULT_DENSITY: Density = '3'

const densityClass: Record<Density, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const segmentedGroup = 'gap-0.5 rounded-md border border-input p-0.5'
const segmentedItem
  = 'h-6 min-w-7 rounded-sm px-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-mute first:rounded-l-sm last:rounded-r-sm hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-foreground'

export function LiveStreamsView({
  streams,
  hlsAddress,
  webrtcAddress,
  iceServers,
  remoteMediaMtxUrl,
  publishTargets,
  playDisabled = false,
}: {
  streams: Stream[]
  hlsAddress: string
  webrtcAddress?: string
  iceServers?: RTCIceServer[]
  remoteMediaMtxUrl: string
  publishTargets: PublishTarget[]
  playDisabled?: boolean
}) {
  const t = useTranslations('Streams.toolbar')
  const search = useSearch({ strict: false }) as { play?: string }
  const [density, setDensity] = useState<Density>(() => {
    const stored = window.localStorage.getItem(DENSITY_KEY)
    return stored === '2' || stored === '3' || stored === '4' ? stored : DEFAULT_DENSITY
  })
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(readPlaybackMode)

  const updateDensity = (value: string) => {
    if (value !== '2' && value !== '3' && value !== '4')
      return
    setDensity(value)
    window.localStorage.setItem(DENSITY_KEY, value)
  }

  const updatePlaybackMode = (value: string) => {
    if (!isPlaybackMode(value))
      return
    setPlaybackMode(value)
    window.localStorage.setItem(PLAYBACK_MODE_KEY, value)
  }

  const liveCount = search.play?.split(',').filter(Boolean).length ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {t('summary', { count: streams.length, live: liveCount })}
        </p>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={playbackMode}
            onValueChange={updatePlaybackMode}
            aria-label={t('playbackAria')}
            className={segmentedGroup}
          >
            <ToggleGroupItem value="auto" className={segmentedItem}>
              {t('playbackAuto')}
            </ToggleGroupItem>
            <ToggleGroupItem value="low-lat" className={segmentedItem}>
              {t('playbackLowLat')}
            </ToggleGroupItem>
            <ToggleGroupItem value="compat" className={segmentedItem}>
              {t('playbackCompat')}
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            value={density}
            onValueChange={updateDensity}
            aria-label={t('densityAria')}
            className={cn(segmentedGroup, 'hidden sm:flex')}
          >
            {(['2', '3', '4'] as const).map(value => (
              <ToggleGroupItem key={value} value={value} className={segmentedItem}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className={cn('grid grid-cols-1 gap-3.5', densityClass[density])}>
        {streams.map(stream => (
          <StreamCard
            key={stream.name}
            streamName={stream.name}
            readyTime={stream.readyTime}
            recording={stream.recording}
            codecs={stream.codecs}
            viewers={stream.viewers}
            snapshotMtime={stream.snapshotMtime}
            hlsAddress={hlsAddress}
            webrtcAddress={webrtcAddress}
            iceServers={iceServers}
            playbackMode={playbackMode}
            remoteMediaMtxUrl={remoteMediaMtxUrl}
            publishTargets={publishTargets}
            playDisabled={playDisabled}
          />
        ))}
      </div>
    </div>
  )
}
