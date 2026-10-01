import { MEDIAMTX_MIN_VERSION } from '@connect/contract'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { useConnectionState } from '@/hooks/use-connection-state'
import { cn } from '@/lib/utils'
import { orpc } from '@/orpc'

export function ConnectionStatus() {
  const t = useTranslations('Common.connection')
  const { connected, unknown } = useConnectionState()
  // Changes only when MediaMTX restarts, so it isn't polled with the path list.
  const info = useQuery({ ...orpc.mediamtx.info.queryOptions(), staleTime: 60_000 })

  if (unknown)
    return null

  const version = info.data?.version
  const tooOld = version && info.data?.belowMinimum
    ? t('tooOld', { version, minimum: `v${MEDIAMTX_MIN_VERSION}` })
    : undefined

  return (
    <span
      aria-live="polite"
      className="hidden items-center gap-2 font-mono text-status text-mute sm:inline-flex"
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          connected ? 'bg-link' : 'bg-destructive',
        )}
      />
      {!connected
        ? t('offline')
        : version
          ? (
              <span>
                {t.rich('connectedVersion', {
                  // MediaMTX's own string, verbatim.
                  version,
                  v: chunks => (
                    <span title={tooOld} className={cn(tooOld && 'text-warning')}>
                      {chunks}
                      {tooOld && <span className="sr-only">{tooOld}</span>}
                    </span>
                  ),
                })}
              </span>
            )
          : t('connected')}
    </span>
  )
}
