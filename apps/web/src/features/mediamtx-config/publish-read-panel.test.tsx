import type { StubApi } from '@/test/rpc-server'
import { screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathConfigPage } from './path-config-page'
import { PublishReadPanel } from './publish-read-panel'

// "What do I put in OBS?" answered from the server's own listen addresses, on
// the host the operator's browser reaches MediaMTX at. What this suite covers is
// the composition the page does on top of `lib/publish.ts`: which host, which
// tab, which note, and that a copy button copies what it shows.
let global: unknown = { rtmpAddress: ':11935' }
// Set to make the global config read fail outright rather than answer null.
let globalFails = false

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  globalConfig: () => {
    if (globalFails)
      throw new Error('MediaMTX is down')
    return global
  },
  appConfig: () => ({
    // Deliberately distinct hosts: the API's internal one must never leak.
    mediaMtxUrl: 'http://mediamtx',
    mediaMtxApiPort: 9997,
    remoteMediaMtxUrl: 'http://cam.lan:8080',
    recordingsDirectory: '/recordings',
    screenshotsDirectory: '/screenshots',
  }),
  pathConfig: () => ({ status: 'unresolved' }),
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  global = { rtmpAddress: ':11935' }
  globalFails = false
  vi.restoreAllMocks()
})
afterAll(() => server.close())

describe('the publish and read tabs', () => {
  it('lists each tab\'s URLs on the browser-facing host', async () => {
    const view = await renderWithProviders(<PublishReadPanel name="cams/front" source={undefined} />)

    expect(await screen.findByText('rtmp://cam.lan:11935/cams/front')).toBeInTheDocument()
    expect(screen.getByText('rtsp://cam.lan:8554/cams/front')).toBeInTheDocument()
    expect(screen.getByText('http://cam.lan:8889/cams/front/whip')).toBeInTheDocument()
    expect(screen.queryByText(/\/\/mediamtx/)).not.toBeInTheDocument()

    await view.user.click(screen.getByRole('tab', { name: 'Read' }))

    expect(await screen.findByText('http://cam.lan:8888/cams/front/index.m3u8')).toBeInTheDocument()
    expect(screen.getByText('srt://cam.lan:8890?streamid=read:cams/front')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /WebRTC page/ }))
      .toHaveAttribute('href', 'http://cam.lan:8889/cams/front')
    expect(screen.queryByText(/\/\/mediamtx/)).not.toBeInTheDocument()
  })

  it('hides a protocol the server has disabled', async () => {
    global = { rtmp: false }
    await renderWithProviders(<PublishReadPanel name="cam" source={undefined} />)

    expect(await screen.findByText('rtsp://cam.lan:8554/cam')).toBeInTheDocument()
    expect(screen.queryByText(/^rtmp:/)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'RTMP' })).not.toBeInTheDocument()
  })
})

describe('a path that pulls from a source', () => {
  it('says MediaMTX refuses publishers instead of listing publish URLs', async () => {
    const view = await renderWithProviders(<PublishReadPanel name="cam" source="rtsp://10.0.0.5:554/live" />)

    expect(await screen.findByText(/This path pulls from its source/)).toBeInTheDocument()
    expect(screen.queryByText('rtsp://cam.lan:8554/cam')).not.toBeInTheDocument()

    // Reading still works the same.
    await view.user.click(screen.getByRole('tab', { name: 'Read' }))
    expect(await screen.findByText('rtsp://cam.lan:8554/cam')).toBeInTheDocument()
  })

  it('treats an explicit publisher source as publishable', async () => {
    await renderWithProviders(<PublishReadPanel name="cam" source="publisher" />)

    expect(await screen.findByText('rtsp://cam.lan:8554/cam')).toBeInTheDocument()
    expect(screen.queryByText(/This path pulls from its source/)).not.toBeInTheDocument()
  })
})

// A name nothing publishes to yet is exactly when the publish URL is needed.
it('renders on the page of a path MediaMTX cannot resolve', async () => {
  await renderWithProviders(<PathConfigPage name="newcam" />)

  expect(await screen.findByText('rtsp://cam.lan:8554/newcam')).toBeInTheDocument()
  expect(screen.getByText(/No config to show/)).toBeInTheDocument()
})

it('says so when the server\'s listen addresses could not be read', async () => {
  global = null
  await renderWithProviders(<PublishReadPanel name="cam" source={undefined} />)

  expect(await screen.findByText(/Couldn't read the server's listen addresses/)).toBeInTheDocument()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
})

// Not the same as a null answer, but just as unknown: default-port URLs here
// would look right and point at the wrong place.
it('says so when the read of the listen addresses fails outright', async () => {
  globalFails = true
  await renderWithProviders(<PublishReadPanel name="cam" source={undefined} />)

  expect(await screen.findByText(/Couldn't read the server's listen addresses/)).toBeInTheDocument()
  expect(screen.queryByText('rtsp://cam.lan:8554/cam')).not.toBeInTheDocument()
})

describe('copying', () => {
  it('puts exactly the displayed text on the clipboard', async () => {
    const view = await renderWithProviders(<PublishReadPanel name="cam" source={undefined} />)
    const block = (await screen.findByRole('heading', { name: 'SRT' })).closest('section')!

    await view.user.click(within(block).getByRole('button', { name: 'Copy SRT URL' }))
    expect(await screen.findByText('Copied to the clipboard')).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toBe('srt://cam.lan:8890?streamid=publish:cam&pkt_size=1316')

    await view.user.click(within(block).getByRole('button', { name: 'Copy the ffmpeg snippet for SRT' }))
    const shown = within(block).getByText(/-f mpegts/).textContent
    await waitFor(async () => expect(await navigator.clipboard.readText()).toBe(shown))
  })

  it('reports a clipboard the browser refused', async () => {
    const view = await renderWithProviders(<PublishReadPanel name="cam" source={undefined} />)
    await screen.findByText('rtsp://cam.lan:8554/cam')
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))

    await view.user.click(screen.getByRole('button', { name: 'Copy RTSP URL' }))

    expect(await screen.findByText('Couldn\'t copy')).toBeInTheDocument()
    expect(screen.queryByText('Copied to the clipboard')).not.toBeInTheDocument()
  })
})
