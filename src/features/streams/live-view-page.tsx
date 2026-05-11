import type {
  Error,
  GlobalConf,
  HttpResponse,
  PathList,
} from '@/lib/mediamtx/generated'

import { AlertTriangle, MonitorPlay, Settings, Wifi } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { RefreshButton } from '@/components/refresh-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAppConfig } from '@/features/client-config/client-config.queries'
import { Link } from '@/i18n/navigation'
import { logger } from '@/lib/logger'
import { Api } from '@/lib/mediamtx/generated'

import { LiveStreamsView } from './live-streams-view'

export const dynamic = 'force-dynamic'

export async function LiveViewPage() {
  const t = await getTranslations('Streams')
  const crumbs = [{ label: t('crumbLive') }]
  const config = await getAppConfig()
  if (!config) {
    return (
      <>
        <PageHeader crumbs={crumbs} />
        <PageLayout header={t('header')} subHeader={t('subHeader')}>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('errors.configTitle')}</AlertTitle>
            <AlertDescription>
              {t('errors.configDescription')}
            </AlertDescription>
          </Alert>
        </PageLayout>
      </>
    )
  }

  let paths: HttpResponse<PathList, Error> | undefined
  let mediaMtxConfig: HttpResponse<GlobalConf, Error> | undefined
  let connectionError = false

  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    paths = await api.v3.pathsList({}, { cache: 'no-store' })
    mediaMtxConfig = await api.v3.configGlobalGet({ cache: 'no-store' })
  }
  catch (error) {
    connectionError = true
    logger.error(
      `Error reaching MediaMTX at: ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
      error,
    )
  }

  const remoteMediaMtxUrl = config.remoteMediaMtxUrl
  const hasStreams = paths?.data.items && paths.data.items.length > 0
  const isConnected = mediaMtxConfig?.data.hlsAddress && !connectionError

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header={t('header')} subHeader={t('subHeader')}>
        {connectionError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('errors.connectionTitle')}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {t('errors.connectionLead')}
                {' '}
                <code className="bg-muted px-1 rounded text-foreground">
                  {config.mediaMtxUrl}
                  :
                  {config.mediaMtxApiPort}
                </code>
              </p>
              <p className="text-sm">
                {t('errors.connectionHint')}
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/config">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('errors.checkConfigBtn')}
                  </Button>
                </Link>
                <RefreshButton />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!connectionError && !remoteMediaMtxUrl && (
          <EmptyState
            icon={Wifi}
            title={t('empty.configureRemoteTitle')}
            description={t('empty.configureRemoteDescription')}
          >
            <Link href="/config">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                {t('empty.goToConfig')}
              </Button>
            </Link>
          </EmptyState>
        )}

        {isConnected && !hasStreams && (
          <EmptyState
            icon={MonitorPlay}
            title={t('empty.noStreamsTitle')}
            description={t('empty.noStreamsDescription')}
          />
        )}

        {isConnected && hasStreams && remoteMediaMtxUrl && (
          <LiveStreamsView
            streams={paths?.data.items?.map(({ name, readyTime }) => ({
              name: name ?? '',
              readyTime,
            })) ?? []}
            hlsAddress={mediaMtxConfig?.data.hlsAddress ?? ''}
            remoteMediaMtxUrl={remoteMediaMtxUrl}
          />
        )}
      </PageLayout>
    </>
  )
}
