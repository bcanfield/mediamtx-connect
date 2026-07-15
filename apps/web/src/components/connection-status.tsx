import { useTranslations } from 'use-intl'

import { useConnectionState } from '@/hooks/use-connection-state'
import { cn } from '@/lib/utils'

export function ConnectionStatus() {
  const t = useTranslations('Common.connection')
  const { connected, unknown } = useConnectionState()

  if (unknown)
    return null

  return (
    <span
      aria-live="polite"
      className="hidden items-center gap-2 font-mono text-[11px] text-mute sm:inline-flex"
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          connected ? 'bg-link' : 'bg-live',
        )}
      />
      {connected ? t('connected') : t('offline')}
    </span>
  )
}
