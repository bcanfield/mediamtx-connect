import type { PathHealth } from '@connect/contract'
import { useQuery } from '@tanstack/react-query'
import { useFormatter, useTranslations } from 'use-intl'

import { Badge } from '@/components/ui/badge'
import { formatBytes, formatUptime } from '@/lib/format'
import { orpc } from '@/orpc'

// Fast enough that the byte counters visibly move, slow enough to be a
// background read on a page whose main job is editing config.
const PATH_HEALTH_POLL_MS = 5000

// What the stored config never answers: whether the camera is actually working.
// Everything here is runtime state off `v3/paths/get`, so it says nothing about
// a path's settings and nothing here is editable.
export function PathHealthPanel({ name }: { name: string }) {
  const t = useTranslations('Config.pathHealth')
  const health = useQuery({
    ...orpc.config.mediamtx.getPathHealth.queryOptions({ input: { name } }),
    // The interval lives on the query, so leaving the page unmounts it and the
    // polling stops with it.
    refetchInterval: PATH_HEALTH_POLL_MS,
  })
  // Annotated because the union `useQuery` infers doesn't narrow on `status`.
  const state: PathHealth | null | undefined = health.data
  const live = state?.status === 'live' ? state : null

  return (
    <section className="rounded-panel border">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <h2 className="text-control font-medium">{t('title')}</h2>
        {state && (
          live
            ? (
                <span className="flex items-center gap-1.5 font-mono text-meta">
                  <span aria-hidden className="size-1.5 rounded-full bg-live" />
                  {t('stateLive')}
                </span>
              )
            : <span className="font-mono text-meta text-mute">{t('stateIdle')}</span>
        )}
      </header>

      {/* An unreachable server is its own answer: an idle state here would
          claim the path is down when we simply couldn't ask. */}
      {health.isSuccess && state === null && (
        <p className="px-4 py-3.5 text-meta text-muted-foreground">{t('unreachable')}</p>
      )}
      {state?.status === 'idle' && (
        <p className="px-4 py-3.5 text-meta text-muted-foreground">{t('idleLead')}</p>
      )}
      {live && <LiveHealth health={live} />}
    </section>
  )
}

function LiveHealth({ health }: { health: Extract<PathHealth, { status: 'live' }> }) {
  const t = useTranslations('Config.pathHealth')
  const format = useFormatter()
  const readerTypes = [...new Set(health.readers)].join(', ')

  return (
    <div className="flex flex-col gap-4 px-4 py-3.5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {/* A ready path has a readyTime; one that somehow doesn't drops the
            stat rather than showing an uptime measured from nothing. */}
        {health.readyTime && <Stat label={t('uptime')} value={formatUptime(health.readyTime)} />}
        <Stat label={t('readers')} value={format.number(health.readers.length)} />
        <Stat label={t('received')} value={formatBytes(health.bytesReceived)} />
        <Stat label={t('sent')} value={formatBytes(health.bytesSent)} />
        {health.framesInError !== null && (
          <Stat label={t('framesInError')} value={format.number(health.framesInError)} />
        )}
      </dl>

      {health.tracks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-meta text-muted-foreground">{t('tracks')}</span>
          {health.tracks.map((track, index) => (
            // Two tracks of the same codec is normal, so the codec alone isn't
            // a key — and MediaMTX's own order is the only identity they have.
            // eslint-disable-next-line react/no-array-index-key
            <Badge key={index} variant="secondary" className="font-mono">
              {track.resolution
                ? t('trackDetail', { codec: track.codec, resolution: track.resolution })
                : track.codec}
            </Badge>
          ))}
        </div>
      )}

      {(health.publisher || health.readers.length > 0) && (
        <div className="flex flex-col gap-1 text-meta text-muted-foreground">
          {health.publisher && <p>{t('publisher', { type: health.publisher })}</p>}
          {health.readers.length > 0 && <p>{t('readerTypes', { types: readerTypes })}</p>}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className="font-mono text-control">{value}</dd>
    </div>
  )
}
