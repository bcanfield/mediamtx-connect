import type { StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { LiveViewPage } from './live-view-page'

// The banner is a claim about the deployment, so what matters is the wiring:
// which of the page's two sources — the global conf and the hostname the
// browser reached this app at — trip it. `advertisesOnlyLoopback` itself is
// covered in `lib/playback.test.ts`.
let globalConfig: Record<string, unknown> = {}

const stub: StubApi = {
  streamsList: () => ({
    status: 'connected',
    hlsAddress: ':8888',
    remoteMediaMtxUrl: 'http://cam.lan',
    streams: [{
      name: 'front-door',
      readyTime: '2026-07-27T10:00:00Z',
      recordState: 'off',
      codecs: [],
      viewers: 0,
      snapshotMtime: null,
    }],
  }),
  globalConfig: () => globalConfig,
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
    await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    expect(banner()).not.toBeInTheDocument()
  })

  it('says nothing when a routable host is advertised alongside loopback', async () => {
    globalConfig = { ...globalConfig, webrtcAdditionalHosts: ['127.0.0.1', 'cam.lan'] }
    await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    expect(banner()).not.toBeInTheDocument()
  })

  it('says nothing when the server serves no WebRTC at all — there is nothing to fix', async () => {
    globalConfig = { ...globalConfig, webrtc: false }
    await renderWithProviders(<LiveViewPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    expect(banner()).not.toBeInTheDocument()
  })
})
