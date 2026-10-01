import type { StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { MediaMTXConfigPage } from './mediamtx-config-page'

const mediamtxInfo = vi.fn<() => unknown>()

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', hlsAddress: ':8888', remoteMediaMtxUrl: null, streams: [] }),
  globalConfig: () => ({ logLevel: 'info' }),
  mediamtxInfo,
}
const server = createRpcServer(stub)

const STARTED = new Date('2026-10-01T14:17:37Z')
const BANNER = 'MediaMTX v1.19.2 is older than v1.20.0, the oldest version Connect supports.'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

// The form's first section, so "the form rendered" is something on screen.
const formHeading = () => screen.findByRole('heading', { name: 'Logging' })

describe('the global config page', () => {
  it('shows the version and when MediaMTX started', async () => {
    mediamtxInfo.mockReturnValue({ version: 'v1.20.0', started: STARTED, belowMinimum: false })
    await renderWithProviders(<MediaMTXConfigPage />)

    // The harness formats in en / UTC.
    expect(await screen.findByText('MediaMTX v1.20.0 · running since Oct 1, 2026, 2:17 PM')).toBeInTheDocument()
    expect(await formHeading()).toBeInTheDocument()
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument()
  })

  // Non-blocking: the operator can still edit what this MediaMTX does serve.
  it('warns about a version older than Connect supports, above a working form', async () => {
    mediamtxInfo.mockReturnValue({ version: 'v1.19.2', started: STARTED, belowMinimum: true })
    await renderWithProviders(<MediaMTXConfigPage />)

    expect(await screen.findByText(BANNER)).toBeInTheDocument()
    expect(await formHeading()).toBeInTheDocument()
  })

  it('shows no version line when MediaMTX serves no version', async () => {
    mediamtxInfo.mockReturnValue({ version: null, started: null, belowMinimum: false })
    await renderWithProviders(<MediaMTXConfigPage />)

    expect(await formHeading()).toBeInTheDocument()
    expect(mediamtxInfo).toHaveBeenCalled()
    expect(screen.queryByText(/running since/)).not.toBeInTheDocument()
  })
})
