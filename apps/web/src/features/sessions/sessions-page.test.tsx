import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { ORPCError } from '@orpc/server'
import { screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { SessionsPage } from './sessions-page'

const kickSession = vi.fn<(input: RpcInputs['sessions']['kick']) => void | Promise<void>>()
let sessions: unknown = { status: 'connected', sessions: [], protocols: [] }

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  sessionsList: () => sessions,
  kickSession,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => {
  kickSession.mockReset()
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const ALL_LISTED = ['rtsp', 'rtsps', 'rtmp', 'rtmps', 'srt', 'webrtc', 'hls']
  .map(protocol => ({ protocol, status: 'listed', truncated: false }))

function session(overrides: Record<string, unknown>) {
  return {
    id: 'a1',
    protocol: 'rtsp',
    path: 'stream1',
    remoteAddr: '172.18.0.4:51234',
    state: 'publish',
    inboundBytes: 2048,
    outboundBytes: 0,
    // The harness pins `now` to 12:00; formatUptime reads the real clock, so
    // only the shape of the uptime is asserted.
    created: new Date('2026-07-27T11:00:00Z'),
    ...overrides,
  }
}

function connected(rows: unknown[], protocols: unknown[] = ALL_LISTED) {
  return { status: 'connected', sessions: rows, protocols, pageSize: 100 }
}

describe('sessions page', () => {
  it('renders one row per session', async () => {
    sessions = connected([
      session({ id: 'a1' }),
      session({ id: 'h1', protocol: 'hls', path: 'stream3', remoteAddr: '10.0.0.9', state: 'read', inboundBytes: null, outboundBytes: 1048576 }),
    ])
    await renderWithProviders(<SessionsPage />)

    await screen.findByText('2 sessions')
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map(row => within(row).getAllByRole('cell').slice(0, 6).map(c => c.textContent))).toEqual([
      ['stream1', 'RTSP', '172.18.0.4:51234', 'publish', '2 kB', '0 byte'],
      ['stream3', 'HLS', '10.0.0.9', 'read', '—', '1 MB'],
    ])
  })

  it('names a protocol MediaMTX has not enabled', async () => {
    sessions = connected([session({})], [
      ...ALL_LISTED.filter(p => p.protocol !== 'rtmps' && p.protocol !== 'srt'),
      { protocol: 'rtmps', status: 'disabled', truncated: false },
      { protocol: 'srt', status: 'failed', truncated: false },
    ])
    await renderWithProviders(<SessionsPage />)

    expect(await screen.findByText('Not listed: RTMPS (not enabled on this server), SRT (couldn\'t be read).')).toBeInTheDocument()
  })

  it('says when a protocol\'s list was cut at the first page', async () => {
    sessions = {
      ...connected([session({})], [
        ...ALL_LISTED.filter(p => p.protocol !== 'webrtc'),
        { protocol: 'webrtc', status: 'listed', truncated: true },
      ]),
      pageSize: 2500,
    }
    await renderWithProviders(<SessionsPage />)

    // The page size comes off the API, formatted per locale.
    expect(await screen.findByText('Showing the first 2,500 WebRTC sessions.')).toBeInTheDocument()
  })

  it('renders the error state, not an empty table, when MediaMTX is unreachable', async () => {
    sessions = { status: 'connection-error', mediaMtxUrl: 'http://127.0.0.1', mediaMtxApiPort: 9997 }
    await renderWithProviders(<SessionsPage />)

    expect(await screen.findByText('Can\'t reach MediaMTX')).toBeInTheDocument()
    expect(screen.getByText('http://127.0.0.1:9997')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('No one is connected')).not.toBeInTheDocument()
  })

  it('reports an empty server as its own state', async () => {
    sessions = connected([])
    await renderWithProviders(<SessionsPage />)

    expect(await screen.findByText('No one is connected')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('kicking a session', () => {
  beforeEach(() => {
    sessions = connected([session({ id: 'srt-7', protocol: 'srt', remoteAddr: '10.0.0.7:4000', state: 'read' })])
  })

  it('names the session in the confirm and kicks only on confirm', async () => {
    const view = await renderWithProviders(<SessionsPage />)

    await view.user.click(await screen.findByRole('button', { name: 'Kick' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Kick SRT client 10.0.0.7:4000 from stream1?')).toBeInTheDocument()
    expect(kickSession).not.toHaveBeenCalled()

    await view.user.click(within(dialog).getByRole('button', { name: 'Kick client' }))

    expect(await screen.findByText('Kicked 10.0.0.7:4000')).toBeInTheDocument()
    expect(kickSession).toHaveBeenCalledWith({ protocol: 'srt', id: 'srt-7' } satisfies RpcInputs['sessions']['kick'])
  })

  it('kicks nothing on cancel', async () => {
    const view = await renderWithProviders(<SessionsPage />)

    await view.user.click(await screen.findByRole('button', { name: 'Kick' }))
    await view.user.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('stream1')).toBeInTheDocument()
    expect(kickSession).not.toHaveBeenCalled()
  })

  it('says the session had already gone when MediaMTX no longer has it', async () => {
    kickSession.mockRejectedValue(new ORPCError('NOT_FOUND'))
    const view = await renderWithProviders(<SessionsPage />)

    await view.user.click(await screen.findByRole('button', { name: 'Kick' }))
    await view.user.click(await screen.findByRole('button', { name: 'Kick client' }))

    expect(await screen.findByText('10.0.0.7:4000 had already disconnected')).toBeInTheDocument()
  })

  it('reports any other failure', async () => {
    kickSession.mockRejectedValue(new ORPCError('INTERNAL_SERVER_ERROR'))
    const view = await renderWithProviders(<SessionsPage />)

    await view.user.click(await screen.findByRole('button', { name: 'Kick' }))
    await view.user.click(await screen.findByRole('button', { name: 'Kick client' }))

    expect(await screen.findByText('Couldn\'t kick the session')).toBeInTheDocument()
  })
})
