import type { StreamsState } from '@connect/contract'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { PageLayout } from '@/components/page-layout'
import { publishTargets } from '@/lib/publish'
import { toIceServers } from '@/lib/whep'
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
  // MediaMTX's WebRTC address and ICE servers come from the global conf rather
  // than from streams.list: they're server-wide, the contract already carries
  // them here, and WHEP needs no per-stream surface of its own.
  const [streamsQuery, configQuery, globalQuery] = useQueries({
    queries: [
      orpc.streams.list.queryOptions(),
      orpc.config.app.get.queryOptions(),
      orpc.config.mediamtx.getGlobal.queryOptions(),
    ],
  })
  const state = streamsQuery.data

  const connected = isConnectedState(state) ? state : null
  const remoteMediaMtxUrl = connected?.remoteMediaMtxUrl ?? null
  const hasStreams = (connected?.streams.length ?? 0) > 0

  // A stream published over any protocol can be read over WebRTC, but only if
  // the server actually serves it — `webrtc: false` means HLS is the only path.
  const webrtcAddress = globalQuery.data?.webrtc === false
    ? undefined
    : globalQuery.data?.webrtcAddress
  // Stable identity: the player's effect keys on this, and a fresh array every
  // render would renegotiate WHEP on every poll.
  const iceServers = useMemo(
    () => toIceServers(globalQuery.data?.webrtcICEServers2),
    [globalQuery.data?.webrtcICEServers2],
  )

  const host = publishHost(configQuery.data?.mediaMtxUrl)
  const targets = useMemo(() => publishTargets(host, globalQuery.data), [host, globalQuery.data])

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
        <ZeroStreamsPanel targets={targets} />
      )}

      {connected && hasStreams && (
        <>
          {!remoteMediaMtxUrl && <PlaybackUrlBanner />}
          <LiveStreamsView
            streams={connected.streams}
            hlsAddress={connected.hlsAddress}
            webrtcAddress={webrtcAddress}
            iceServers={iceServers}
            remoteMediaMtxUrl={remoteMediaMtxUrl ?? ''}
            publishTargets={targets}
            playDisabled={!remoteMediaMtxUrl}
          />
        </>
      )}
    </PageLayout>
  )
}
