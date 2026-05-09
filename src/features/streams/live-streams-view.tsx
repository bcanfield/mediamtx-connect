'use client'

import { Columns2, Columns3, Columns4 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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

interface Stream {
  name: string
  readyTime?: string | null
}

export function LiveStreamsView({
  streams,
  hlsAddress,
  remoteMediaMtxUrl,
}: {
  streams: Stream[]
  hlsAddress: string
  remoteMediaMtxUrl: string
}) {
  const [density, setDensity] = useState<Density>(DEFAULT_DENSITY)

  useEffect(() => {
    const stored = window.localStorage.getItem(DENSITY_KEY)
    if (stored === '2' || stored === '3' || stored === '4') {
      setDensity(stored)
    }
  }, [])

  const updateDensity = (value: string) => {
    if (value !== '2' && value !== '3' && value !== '4')
      return
    setDensity(value)
    window.localStorage.setItem(DENSITY_KEY, value)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <ToggleGroup
          type="single"
          value={density}
          onValueChange={updateDensity}
          aria-label="Grid density"
        >
          <ToggleGroupItem value="2" aria-label="Two columns">
            <Columns2 className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="3" aria-label="Three columns">
            <Columns3 className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="4" aria-label="Four columns">
            <Columns4 className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className={cn('grid grid-cols-1 gap-4', densityClass[density])}>
        {streams.map(stream => (
          <StreamCard
            key={stream.name}
            streamName={stream.name}
            readyTime={stream.readyTime}
            hlsAddress={hlsAddress}
            remoteMediaMtxUrl={remoteMediaMtxUrl}
          />
        ))}
      </div>
    </div>
  )
}
