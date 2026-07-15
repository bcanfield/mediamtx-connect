import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'use-intl'

import { StatusPanel } from '@/components/status-panel'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

const RETRY_SECONDS = 15

export function ServerUnreachablePanel({
  mediaMtxUrl,
  mediaMtxApiPort,
  onRetry,
}: {
  mediaMtxUrl: string
  mediaMtxApiPort: number
  onRetry: () => void
}) {
  const t = useTranslations('Streams.errors')
  const [seconds, setSeconds] = useState(RETRY_SECONDS)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          onRetry()
          return RETRY_SECONDS
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onRetry])

  const retryNow = () => {
    setSeconds(RETRY_SECONDS)
    onRetry()
  }

  return (
    <StatusPanel
      tone="error"
      icon={<X aria-hidden className="size-4" />}
      title={t('unreachableTitle')}
      description={(
        <>
          {t('unreachableLead')}
          {' '}
          <code className="font-mono text-foreground">
            {mediaMtxUrl}
            :
            {mediaMtxApiPort}
          </code>
        </>
      )}
      action={(
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/config">{t('openAppConfig')}</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={retryNow}>
            {t('retry')}
          </Button>
        </div>
      )}
    >
      <p aria-live="polite" className="font-mono text-[10.5px] text-faint">
        {t('retryCountdown', { seconds })}
      </p>
    </StatusPanel>
  )
}

export function ZeroStreamsPanel({ host }: { host: string }) {
  const t = useTranslations('Streams.empty')

  const hints = [
    { protocol: 'RTSP', url: `rtsp://${host}:8554/` },
    { protocol: 'RTMP', url: `rtmp://${host}:1935/` },
    { protocol: 'SRT', url: `srt://${host}:8890?streamid=publish:` },
  ]

  return (
    <div className="mx-auto my-14 flex w-full max-w-lg flex-col items-center gap-5 rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
      <div className="space-y-1.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          {t('noStreamsTitle')}
        </h2>
        <p className="text-[12px] text-muted-foreground">{t('noStreamsLead')}</p>
      </div>
      <div className="flex w-full flex-col gap-1.5 overflow-x-auto rounded-md border bg-card p-3.5 text-left font-mono text-[11.5px] text-muted-foreground">
        {hints.map(hint => (
          <span key={hint.protocol} className="whitespace-nowrap">
            {hint.url}
            <span className="text-link">{t('streamNamePlaceholder')}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function PlaybackUrlBanner() {
  const t = useTranslations('Streams.banner')

  return (
    <StatusPanel
      tone="warning"
      layout="banner"
      title={t('playbackUrlTitle')}
      description={t('playbackUrlLead')}
      action={(
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href="/config">{t('openAppConfig')}</Link>
        </Button>
      )}
    />
  )
}
