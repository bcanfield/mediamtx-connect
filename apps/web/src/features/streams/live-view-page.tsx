import type { StreamsState } from '@connect/contract'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, MonitorPlay, Settings, Wifi } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { RefreshButton } from '@/components/refresh-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { orpc } from '@/orpc'

import { LiveStreamsView } from './live-streams-view'

function isConnectedState(
  state: StreamsState | undefined,
): state is Extract<StreamsState, { status: 'connected' }> {
  return state?.status === 'connected'
}

export function LiveViewPage() {
  const t = useTranslations('Streams')
  const crumbs = [{ label: t('crumbLive') }]
  const streamsQuery = useQuery(orpc.streams.list.queryOptions())
  const state = streamsQuery.data

  const connected = isConnectedState(state) ? state : null
  const remoteMediaMtxUrl = connected?.remoteMediaMtxUrl ?? null
  const hasStreams = (connected?.streams.length ?? 0) > 0
  const isConnected = Boolean(connected?.hlsAddress)

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header={t('header')} subHeader={t('subHeader')}>
        {state?.status === 'connection-error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('errors.connectionTitle')}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {t('errors.connectionLead')}
                {' '}
                <code className="bg-muted px-1 rounded text-foreground">
                  {state.mediaMtxUrl}
                  :
                  {state.mediaMtxApiPort}
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

        {connected && !remoteMediaMtxUrl && (
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

        {connected && isConnected && hasStreams && remoteMediaMtxUrl && (
          <LiveStreamsView
            streams={connected.streams}
            hlsAddress={connected.hlsAddress}
            remoteMediaMtxUrl={remoteMediaMtxUrl}
          />
        )}
      </PageLayout>
    </>
  )
}
