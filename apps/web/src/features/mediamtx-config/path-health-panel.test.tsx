import type { StubApi } from '@/test/rpc-server'
import { act, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathHealthPanel } from './path-health-panel'

// The stored config never says whether the camera is actually working, so what
// this suite covers is the other half: what the runtime read renders, and that
// a path MediaMTX isn't running reads as idle rather than as a failure.
const pathHealth = vi.fn<() => unknown>()

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  pathHealth,
}

const server = createRpcServer(stub)

const LIVE = {
  status: 'live',
  // Uptime is measured against the wall clock rather than the providers' fixed
  // `now`, so this is anchored to the run instead of to a literal timestamp.
  readyTime: new Date(Date.now() - 135 * 60_000).toISOString(),
  publisher: 'rtspSession',
  readers: ['webRTCSession', 'hlsMuxer', 'webRTCSession'],
  tracks: [
    { codec: 'H264', resolution: '1920×1080' },
    { codec: 'MPEG-4 Audio', resolution: null },
  ],
  bytesReceived: 1024 ** 2 * 412.5,
  bytesSent: 1024 ** 3 * 1.5,
  framesInError: 12,
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.useRealTimers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

describe('a live path', () => {
  it('shows its tracks, sessions, counters and uptime', async () => {
    pathHealth.mockReturnValue(LIVE)
    await renderWithProviders(<PathHealthPanel name="stream1" />)

    expect(await screen.findByText('LIVE')).toBeInTheDocument()
    expect(screen.getByText('2h 15m')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('412.5 MB')).toBeInTheDocument()
    expect(screen.getByText('1.5 GB')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    // Resolution rides along only for the tracks whose codec has one.
    expect(screen.getByText('H264 · 1920×1080')).toBeInTheDocument()
    expect(screen.getByText('MPEG-4 Audio')).toBeInTheDocument()
    expect(screen.getByText('Publishing over rtspSession')).toBeInTheDocument()
    expect(screen.getByText('Read over webRTCSession, hlsMuxer')).toBeInTheDocument()
  })

  // A counter MediaMTX never sent is not a counter reading zero, so the stat is
  // left off rather than claiming a clean feed.
  it('leaves out the error counter the server did not send', async () => {
    pathHealth.mockReturnValue({ ...LIVE, framesInError: null })
    await renderWithProviders(<PathHealthPanel name="stream1" />)

    expect(await screen.findByText('LIVE')).toBeInTheDocument()
    expect(screen.queryByText('Frames in error')).not.toBeInTheDocument()
  })
})

describe('a path that is not running', () => {
  it('reads as idle rather than as an error', async () => {
    pathHealth.mockReturnValue({ status: 'idle' })
    await renderWithProviders(<PathHealthPanel name="stopped" />)

    expect(await screen.findByText('idle')).toBeInTheDocument()
    expect(screen.getByText(/Nothing is publishing to this path/)).toBeInTheDocument()
    expect(screen.queryByText('Uptime')).not.toBeInTheDocument()
    expect(screen.queryByText(/Couldn't reach MediaMTX/)).not.toBeInTheDocument()
  })

  // Distinct from idle: a server that didn't answer says nothing about whether
  // the path is up, and IDLE would claim it is down.
  it('says so when MediaMTX could not be reached', async () => {
    pathHealth.mockReturnValue(null)
    await renderWithProviders(<PathHealthPanel name="stream1" />)

    expect(await screen.findByText(/Couldn't reach MediaMTX/)).toBeInTheDocument()
    expect(screen.queryByText('idle')).not.toBeInTheDocument()
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
  })
})

// Counters that stop moving are worse than no counters, and a page left open in
// a background tab that keeps polling is worse still.
describe('polling', () => {
  it('refreshes while the page is open and stops when it is left', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    pathHealth.mockReturnValue(LIVE)
    const view = await renderWithProviders(<PathHealthPanel name="stream1" />)
    expect(await screen.findByText('LIVE')).toBeInTheDocument()

    await act(() => vi.advanceTimersByTimeAsync(20_000))
    const whileOpen = pathHealth.mock.calls.length
    expect(whileOpen).toBeGreaterThan(1)

    view.unmount()
    await act(() => vi.advanceTimersByTimeAsync(60_000))

    expect(pathHealth).toHaveBeenCalledTimes(whileOpen)
  })
})
