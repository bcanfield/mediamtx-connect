import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'use-intl'

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
    <div className="mx-auto my-14 flex w-full max-w-md flex-col items-center gap-4 rounded-[10px] border border-[#f3d1d1] bg-gradient-to-b from-live/[0.04] to-transparent px-8 py-12 text-center dark:border-[#2e1414]">
      <span className="flex size-10 items-center justify-center rounded-full border border-live/35 text-live-foreground">
        <X aria-hidden className="size-4" />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          {t('unreachableTitle')}
        </h2>
        <p className="text-[12px] text-muted-foreground">
          {t('unreachableLead')}
          {' '}
          <code className="font-mono text-foreground">
            {mediaMtxUrl}
            :
            {mediaMtxApiPort}
          </code>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/config">
          <Button size="sm">{t('openAppConfig')}</Button>
        </Link>
        <Button size="sm" variant="outline" onClick={retryNow}>
          {t('retry')}
        </Button>
      </div>
      <p aria-live="polite" className="font-mono text-[10.5px] text-faint">
        {t('retryCountdown', { seconds })}
      </p>
    </div>
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
    <div className="mx-auto my-14 flex w-full max-w-lg flex-col items-center gap-5 rounded-[10px] border border-dashed border-[#d9d9d9] px-8 py-12 text-center dark:border-[#2a2a2a]">
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#e8d5b0] bg-gradient-to-b from-warning/[0.06] to-transparent px-4 py-3 dark:border-[#3a2c10]">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium">{t('playbackUrlTitle')}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">
            {t('playbackUrlLead')}
          </p>
        </div>
      </div>
      <Link href="/config" className="shrink-0">
        <Button size="sm" variant="outline">
          {t('openAppConfig')}
        </Button>
      </Link>
    </div>
  )
}
