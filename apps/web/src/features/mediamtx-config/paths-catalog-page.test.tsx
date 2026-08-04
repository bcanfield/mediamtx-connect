import type { StubApi } from '@/test/rpc-server'
import { screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathsCatalogPage } from './paths-catalog-page'

// What the page reads: the connected branch carries one row per config entry,
// the error branch carries the address that didn't answer.
let catalog: unknown = { status: 'connected', paths: [] }

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  pathsCatalog: () => catalog,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function entry(overrides: Record<string, unknown>) {
  return { name: 'front-door', source: 'publisher', isRegex: false, active: false, ...overrides }
}

describe('paths catalog', () => {
  it('lists every configured path with its source', async () => {
    catalog = {
      status: 'connected',
      paths: [
        entry({ name: 'front-door', source: 'rtsp://cam.lan/stream' }),
        entry({ name: 'garage', source: 'publisher' }),
      ],
    }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByText('2 configured paths')).toBeInTheDocument()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map(row => within(row).getAllByRole('cell').map(c => c.textContent))).toEqual([
      ['front-door', 'rtsp://cam.lan/stream', 'idle'],
      ['garage', 'publisher', 'idle'],
    ])
  })

  it('badges a regex entry and marks a live one', async () => {
    catalog = {
      status: 'connected',
      paths: [entry({ name: '~^cam[0-9]+$', isRegex: true, active: true })],
    }
    await renderWithProviders(<PathsCatalogPage />)

    const row = (await screen.findAllByRole('row'))[1]!
    expect(within(row).getByText('REGEX')).toBeInTheDocument()
    expect(within(row).getByText('LIVE')).toBeInTheDocument()
  })

  // A source composed by the guided add carries the camera's password, and a
  // table nobody had to open is the last place to print it.
  it('masks the password in a source that carries credentials', async () => {
    catalog = {
      status: 'connected',
      paths: [entry({ source: 'rtsp://admin:hunter2@cam.lan:554/live' })],
    }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByText('rtsp://admin:••••••••@cam.lan:554/live')).toBeInTheDocument()
    expect(screen.queryByText(/hunter2/)).not.toBeInTheDocument()
  })

  // The catalog is the only way into a path's detail page, so a row that
  // doesn't link there leaves the page unreachable.
  it('opens a path detail page from its row', async () => {
    catalog = { status: 'connected', paths: [entry({ name: 'front-door' })] }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByRole('link', { name: 'front-door' }))
      .toHaveAttribute('href', '/config/mediamtx/paths/front-door')
  })

  it('offers the guided add from the header', async () => {
    catalog = { status: 'connected', paths: [entry({})] }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByRole('link', { name: 'Add RTSP path' }))
      .toHaveAttribute('href', '/config/mediamtx/add-path')
  })

  it('leaves the regex badge off a plain entry', async () => {
    catalog = { status: 'connected', paths: [entry({})] }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByText('front-door')).toBeInTheDocument()
    expect(screen.queryByText('REGEX')).not.toBeInTheDocument()
  })

  // An unreachable server and a server with nothing configured are different
  // answers; rendering the empty state for both would claim the second.
  it('renders the error state, not an empty catalog, when MediaMTX is unreachable', async () => {
    catalog = { status: 'connection-error', mediaMtxUrl: 'http://127.0.0.1', mediaMtxApiPort: 9997 }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByText('Can\'t reach MediaMTX')).toBeInTheDocument()
    expect(screen.getByText('http://127.0.0.1:9997')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('No paths are configured')).not.toBeInTheDocument()
  })

  it('reports an empty catalog as its own state', async () => {
    catalog = { status: 'connected', paths: [] }
    await renderWithProviders(<PathsCatalogPage />)

    expect(await screen.findByText('No paths are configured')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open path defaults' }))
      .toHaveAttribute('href', '/config/mediamtx/path-defaults')
  })
})
