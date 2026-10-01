import type { StubApi } from '@/test/rpc-server'
import { screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { LiveViewPage } from './live-view-page'

// The banner is a claim about the deployment, so what matters is the wiring:
// which of the page's two sources — the global conf and the hostname the
// browser reached this app at — trip it. `advertisesOnlyLoopback` itself is
// covered in `lib/playback.test.ts`.
let globalConfig: Record<string, unknown> = {}
let streams: unknown[] = []

const frontDoor = {
  name: 'front-door',
  readyTime: '2026-07-27T10:00:00Z',
  recordState: 'off',
  codecs: [],
  viewers: 0,
  snapshotMtime: null,
}

const stub: StubApi = {
  streamsList: () => ({
    status: 'connected',
    hlsAddress: ':8888',
    remoteMediaMtxUrl: 'http://cam.lan',
    streams,
  }),
  globalConfig: () => globalConfig,
  // The docker-compose shape: the API reaches MediaMTX by its service name,
  // which no operator's machine can resolve.
  appConfig: () => ({
    mediaMtxUrl: 'http://mediamtx',
    mediaMtxApiPort: 9997,
    remoteMediaMtxUrl: 'http://cam.lan',
    recordingsDirectory: '/recordings',
    screenshotsDirectory: '/screenshots',
  }),
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// happy-dom's control API, which it ships no global type augmentation for.
const happyDom = (window as unknown as {
  happyDOM: {
    setURL: (url: string) => void
    settings: { fetch: { disableSameOriginPolicy: boolean } }
  }
}).happyDOM

// The oRPC client pinned `window.location.origin` when it was imported, so
// moving the document off localhost makes every query cross-origin.
function browsingFrom(hostname: string) {
  happyDom.settings.fetch.disableSameOriginPolicy = true
  happyDom.setURL(`http://${hostname}/`)
}

const banner = () => screen.queryByText('WebRTC hosts are loopback-only')

beforeEach(() => {
  streams = [frontDoor]
  globalConfig = { webrtc: true, webrtcAddress: ':8889', webrtcAdditionalHosts: ['127.0.0.1'] }
  browsingFrom('cam.lan')
})

describe('the loopback WebRTC banner', () => {
  it('warns when the only advertised host is one this browser cannot route to', async () => {
    await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    expect(banner()).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open WebRTC Config' }))
      .toHaveAttribute('href', '/config/mediamtx/global?section=webrtc')
  })

  it('says nothing to a browser on the machine MediaMTX is advertising', async () => {
    browsingFrom('localhost')
    const { queryClient } = await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))
    expect(banner()).not.toBeInTheDocument()
  })

  it('says nothing when a routable host is advertised alongside loopback', async () => {
    globalConfig = { ...globalConfig, webrtcAdditionalHosts: ['127.0.0.1', 'cam.lan'] }
    const { queryClient } = await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))
    expect(banner()).not.toBeInTheDocument()
  })

  it('says nothing when the server serves no WebRTC at all — there is nothing to fix', async () => {
    globalConfig = { ...globalConfig, webrtc: false }
    const { queryClient } = await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))
    expect(banner()).not.toBeInTheDocument()
  })
})

describe('publish URL hints', () => {
  it('point at the browser-facing MediaMTX host, not the one the API uses', async () => {
    streams = []
    browsingFrom('connect.lan')
    await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('No streams are publishing')).toBeInTheDocument()
    expect(screen.getByText(/^rtsp:\/\//)).toHaveTextContent('rtsp://cam.lan:8554/')
  })
})
