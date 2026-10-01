import type { StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { ConnectionStatus } from './connection-status'

const mediamtxInfo = vi.fn<() => unknown>()
let streamsState: unknown = { status: 'connected', hlsAddress: ':8888', remoteMediaMtxUrl: null, streams: [] }

const stub: StubApi = {
  streamsList: () => streamsState,
  mediamtxInfo,
}
const server = createRpcServer(stub)

const STARTED = new Date('2026-10-01T14:17:37Z')

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  streamsState = { status: 'connected', hlsAddress: ':8888', remoteMediaMtxUrl: null, streams: [] }
})
afterAll(() => server.close())

describe('connection status', () => {
  it('shows the MediaMTX version next to connected', async () => {
    mediamtxInfo.mockReturnValue({ version: 'v1.20.0', started: STARTED, belowMinimum: false })
    await renderWithProviders(<ConnectionStatus />)

    const version = await screen.findByText('v1.20.0')
    expect(version.closest('[aria-live]')).toHaveTextContent('connected · v1.20.0')
    expect(version).not.toHaveAttribute('title')
  })

  it('explains a version older than Connect supports', async () => {
    mediamtxInfo.mockReturnValue({ version: 'v1.19.2', started: STARTED, belowMinimum: true })
    await renderWithProviders(<ConnectionStatus />)

    const tooOld = 'MediaMTX v1.19.2 is older than v1.20.0, the oldest version Connect supports. Some settings may be missing or refused.'
    const version = await screen.findByTitle(tooOld)
    expect(version).toHaveTextContent('v1.19.2')
    expect(version).toHaveClass('text-warning')
  })

  // MediaMTX older than v1.15.2 has no /v3/info.
  it('says just connected when MediaMTX serves no version', async () => {
    mediamtxInfo.mockReturnValue({ version: null, started: null, belowMinimum: false })
    await renderWithProviders(<ConnectionStatus />)

    expect(await screen.findByText('connected')).toBeInTheDocument()
    await vi.waitFor(() => expect(mediamtxInfo).toHaveBeenCalled())
    expect(screen.getByText('connected').closest('[aria-live]')).toHaveTextContent(/^connected$/)
  })

  it('says just connected when the version read fails', async () => {
    mediamtxInfo.mockReturnValue(null)
    await renderWithProviders(<ConnectionStatus />)

    expect(await screen.findByText('connected')).toBeInTheDocument()
    await vi.waitFor(() => expect(mediamtxInfo).toHaveBeenCalled())
    expect(screen.getByText('connected').closest('[aria-live]')).toHaveTextContent(/^connected$/)
  })

  it('shows no version while MediaMTX is unreachable', async () => {
    streamsState = { status: 'connection-error', mediaMtxUrl: 'http://127.0.0.1', mediaMtxApiPort: 9997 }
    mediamtxInfo.mockReturnValue({ version: 'v1.20.0', started: STARTED, belowMinimum: false })
    await renderWithProviders(<ConnectionStatus />)

    expect(await screen.findByText('offline')).toBeInTheDocument()
    expect(screen.queryByText('v1.20.0')).not.toBeInTheDocument()
  })
})
