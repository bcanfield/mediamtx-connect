import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathConfigPage } from './path-config-page'

// Deleting a path is one call MediaMTX will run against a live stream without
// complaint, so what this suite covers is the guard around it: the affordance
// shows up only for a path that has an entry of its own, only the confirm
// deletes, and the confirm names whatever the delete would cut off.
const deletePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['deletePathConfig']) => void>()

// What the page reads: `resolved` carries the entry the values come from — a
// wildcard until the path is materialized, its own name after — and
// `unresolved` is a name MediaMTX neither runs nor holds an entry for.
let result: unknown = { status: 'resolved', confName: 'all_others', conf: { record: true } }

// What every value on the page is measured against.
let defaults: unknown = null

// What is attached to the runtime path when the confirm asks. Idle by default.
let connections: unknown = { status: 'read', publisher: null, readers: [] }

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  pathConfig: () => result,
  pathDefaults: () => defaults,
  pathConnections: () => connections,
  deletePathConfig,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  defaults = null
  connections = { status: 'read', publisher: null, readers: [] }
  vi.clearAllMocks()
})
afterAll(() => server.close())

async function renderPage(confName: string) {
  result = { status: 'resolved', confName, conf: { record: true } }
  const view = await renderWithProviders(<PathConfigPage name="stream1" />)
  await screen.findByRole('heading', { name: 'Path Config · stream1' })
  return view
}

const ACTIVE_WARNING = 'Deleting this cuts off what is connected right now'

// The confirm button and the trigger share their label, so every click on the
// confirm has to be scoped to the dialog.
function confirmButton() {
  return within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete path' })
}

describe('path deletion', () => {
  it('offers nothing to delete while the path tracks a wildcard entry', async () => {
    await renderPage('all_others')

    expect(await screen.findByText(/currently inherited from all_others/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete path' })).not.toBeInTheDocument()
  })

  it('offers the delete once the path has an entry of its own', async () => {
    await renderPage('stream1')

    expect(await screen.findByRole('button', { name: 'Delete path' })).toBeInTheDocument()
  })

  it('deletes the entry only after the confirm, then lands on the catalog', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()

    // The confirm stays disabled until the connection check lands — clicking
    // through before it would skip the guard entirely.
    await vi.waitFor(() => expect(confirmButton()).toBeEnabled())
    await view.user.click(confirmButton())

    expect(await screen.findByText('Deleted “stream1”')).toBeInTheDocument()
    expect(deletePathConfig).toHaveBeenCalledWith(
      { name: 'stream1' } satisfies RpcInputs['config']['mediamtx']['deletePathConfig'],
    )
    await vi.waitFor(() =>
      expect(view.router.state.location.pathname).toBe('/config/mediamtx/paths'))
  })

  it('leaves the path alone when the confirm is cancelled', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))
    await view.user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()
    expect(view.router.state.location.pathname).toBe('/')
  })

  it('names the publisher and the readers a delete would cut off', async () => {
    connections = { status: 'read', publisher: 'rtspSource', readers: ['webRTCSession', 'hlsMuxer'] }
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))

    expect(await screen.findByText(ACTIVE_WARNING)).toBeInTheDocument()
    expect(screen.getByText('Publisher · rtspSource')).toBeInTheDocument()
    expect(screen.getByText('2 readers · webRTCSession, hlsMuxer')).toBeInTheDocument()
  })

  it('warns rather than claiming nothing is connected when MediaMTX won\'t say', async () => {
    connections = { status: 'unreadable' }
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))

    expect(await screen.findByText(/may cut off a live stream/)).toBeInTheDocument()
    expect(screen.queryByText(ACTIVE_WARNING)).not.toBeInTheDocument()
  })

  it('says nothing about connections for an idle path', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))
    await vi.waitFor(() =>
      expect(screen.queryByText('Checking what is connected…')).not.toBeInTheDocument())

    expect(screen.queryByText(ACTIVE_WARNING)).not.toBeInTheDocument()
    expect(screen.queryByText(/may cut off a live stream/)).not.toBeInTheDocument()
  })
})

// Every key MediaMTX serves for a path comes back filled in, so the only thing
// that separates a value the path set from one it still tracks is whether it
// matches the default. That comparison is what the page renders.
describe('inherited vs overridden', () => {
  // Scoped to the row rather than to the key's text: an edited key also shows
  // up as a save-bar chip, and that would match twice.
  function markerFor(key: string) {
    return within(screen.getByTestId(`field-${key}`)).getByText(/Inherited|Overridden/).textContent
  }

  async function renderAgainstDefaults(conf: Record<string, unknown>, pathDefaults: unknown) {
    defaults = pathDefaults
    result = { status: 'resolved', confName: 'stream1', conf }
    const view = await renderWithProviders(<PathConfigPage name="stream1" />)
    await screen.findByRole('heading', { name: 'Path Config · stream1' })
    return view
  }

  it('separates a value the path overrides from one it still tracks', async () => {
    await renderAgainstDefaults(
      { record: true, recordPath: './recordings/%path/%Y', recordFormat: 'mpegts' },
      { record: true, recordPath: './recordings/%path/%Y', recordFormat: 'fmp4' },
    )

    expect(await screen.findByLabelText('recordFormat')).toBeInTheDocument()
    expect(markerFor('recordPath')).toBe('Inherited')
    expect(markerFor('recordFormat')).toBe('Overridden')
  })

  // `record` is the recording section's header switch rather than a row, so it
  // is the one path key that would otherwise carry no marker.
  it('marks the section switch too', async () => {
    await renderAgainstDefaults({ record: true }, { record: false })

    const header = (await screen.findByRole('switch', { name: 'Recording' })).parentElement!
    expect(within(header).getByText(/Inherited|Overridden/).textContent).toBe('Overridden')
  })

  it('flips a field to overridden while it is being edited', async () => {
    const view = await renderAgainstDefaults(
      { record: true, recordPath: './recordings/%path/%Y' },
      { record: true, recordPath: './recordings/%path/%Y' },
    )

    expect(await screen.findByLabelText('recordPath')).toBeInTheDocument()
    expect(markerFor('recordPath')).toBe('Inherited')

    await view.user.type(screen.getByLabelText('recordPath'), '-alt')

    expect(markerFor('recordPath')).toBe('Overridden')
  })

  // Nothing to compare against is not the same as nothing overridden, so an
  // unreadable path-defaults scope marks no field either way.
  it('marks nothing when path defaults can\'t be read', async () => {
    await renderAgainstDefaults({ record: true, recordPath: './recordings/%path/%Y' }, null)

    expect(await screen.findByLabelText('recordPath')).toBeInTheDocument()
    expect(screen.queryByText('Inherited')).not.toBeInTheDocument()
    expect(screen.queryByText('Overridden')).not.toBeInTheDocument()
  })
})

describe('a name with nothing to resolve', () => {
  it('reports the empty state instead of the invalid-config error', async () => {
    result = { status: 'unresolved' }
    await renderWithProviders(<PathConfigPage name="ghost" />)

    expect(await screen.findByText(/No config to show for/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open path defaults' }))
      .toHaveAttribute('href', '/config/mediamtx/path-defaults')
    expect(screen.queryByText('Invalid Config')).not.toBeInTheDocument()
    // Nothing is shown, so neither the "settings for this stream" promise nor
    // an offer to delete an entry there is no sign of would be true.
    expect(screen.queryByText(/Settings for this stream/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete path' })).not.toBeInTheDocument()
  })
})
