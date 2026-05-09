import type {
  Error,
  GlobalConf,
  HttpResponse,
  PathList,
} from '@/lib/mediamtx/generated'

import { AlertTriangle, MonitorPlay, Settings, Wifi } from 'lucide-react'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { GridLayout } from '@/components/grid-layout'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { RefreshButton } from '@/components/refresh-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAppConfig } from '@/features/client-config/client-config.queries'
import { logger } from '@/lib/logger'
import { Api } from '@/lib/mediamtx/generated'

import { StreamCard } from './stream-card'

export const dynamic = 'force-dynamic'

const crumbs = [{ label: 'Live' }]

export async function LiveViewPage() {
  const config = await getAppConfig()
  if (!config) {
    return (
      <>
        <PageHeader crumbs={crumbs} />
        <PageLayout header="Streams" subHeader="Live views of your active streams">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              Unable to load configuration. Please check your database connection.
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
      <PageLayout header="Streams" subHeader="Live views of your active streams">
        {connectionError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cannot connect to MediaMTX</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Unable to reach MediaMTX at
                {' '}
                <code className="bg-muted px-1 rounded text-foreground">
                  {config.mediaMtxUrl}
                  :
                  {config.mediaMtxApiPort}
                </code>
              </p>
              <p className="text-sm">
                Make sure MediaMTX is running and the URL is correct in your
                configuration.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/config">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Check Config
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
            title="Configure Remote URL"
            description="Set up your Remote MediaMTX URL to view streams in the browser. This should be the URL your browser can use to reach MediaMTX."
          >
            <Link href="/config">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Go to Config
              </Button>
            </Link>
          </EmptyState>
        )}

        {isConnected && !hasStreams && (
          <EmptyState
            icon={MonitorPlay}
            title="No Active Streams"
            description="MediaMTX is connected but no streams are currently active. Start streaming to MediaMTX to see your streams here."
          />
        )}

        {isConnected && hasStreams && remoteMediaMtxUrl && (
          <GridLayout columnLayout="small">
            {paths?.data.items?.map(({ name, readyTime }) => (
              <StreamCard
                key={name}
                props={{
                  streamName: name,
                  readyTime,
                  hlsAddress: mediaMtxConfig?.data.hlsAddress,
                  remoteMediaMtxUrl,
                }}
              />
            ))}
          </GridLayout>
        )}
      </PageLayout>
    </>
  )
}
