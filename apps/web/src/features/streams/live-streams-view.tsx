import { Columns2, Columns3, Columns4 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'use-intl'

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
  const t = useTranslations('Streams.density')
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
    <div className="flex flex-col gap-3">
      <div className="hidden items-center justify-end sm:flex">
        <ToggleGroup
          type="single"
          value={density}
          onValueChange={updateDensity}
          aria-label={t('aria')}
        >
          <ToggleGroupItem value="2" aria-label={t('two')}>
            <Columns2 className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="3" aria-label={t('three')}>
            <Columns3 className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="4" aria-label={t('four')}>
            <Columns4 className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className={cn('grid grid-cols-1 gap-2', densityClass[density])}>
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
