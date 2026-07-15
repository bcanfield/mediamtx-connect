import type { StreamsState } from '@connect/contract'
import { useQueries } from '@tanstack/react-query'

import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { LiveStreamsView } from './live-streams-view'
import {
  PlaybackUrlBanner,
  ServerUnreachablePanel,
  ZeroStreamsPanel,
} from './live-view-states'

function isConnectedState(
  state: StreamsState | undefined,
): state is Extract<StreamsState, { status: 'connected' }> {
  return state?.status === 'connected'
}

function publishHost(mediaMtxUrl: string | undefined): string {
  if (!mediaMtxUrl)
    return window.location.hostname
  try {
    return new URL(mediaMtxUrl).hostname
  }
  catch {
    return mediaMtxUrl
  }
}

export function LiveViewPage() {
  const [streamsQuery, configQuery] = useQueries({
    queries: [
      orpc.streams.list.queryOptions(),
      orpc.config.app.get.queryOptions(),
    ],
  })
  const state = streamsQuery.data

  const connected = isConnectedState(state) ? state : null
  const remoteMediaMtxUrl = connected?.remoteMediaMtxUrl ?? null
  const hasStreams = (connected?.streams.length ?? 0) > 0

  return (
    <PageLayout>
      {state?.status === 'connection-error' && (
        <ServerUnreachablePanel
          mediaMtxUrl={state.mediaMtxUrl}
          mediaMtxApiPort={state.mediaMtxApiPort}
          onRetry={streamsQuery.refetch}
        />
      )}

      {connected && !hasStreams && (
        <ZeroStreamsPanel host={publishHost(configQuery.data?.mediaMtxUrl)} />
      )}

      {connected && hasStreams && (
        <>
          {!remoteMediaMtxUrl && <PlaybackUrlBanner />}
          <LiveStreamsView
            streams={connected.streams}
            hlsAddress={connected.hlsAddress}
            remoteMediaMtxUrl={remoteMediaMtxUrl ?? ''}
            playDisabled={!remoteMediaMtxUrl}
          />
        </>
      )}
    </PageLayout>
  )
}
