import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { ORPCError } from '@orpc/server'
import { screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathConfigPage } from './path-config-page'

// Materializing is one-way from the app's side unless the page can delete the
// entry again, so what this suite covers is the way back: the affordance shows
// up only for a path that has an entry of its own, and only the confirm deletes.
const deletePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['deletePathConfig']) => void>()

const updatePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['updatePathConfig']) => void>()

// What MediaMTX says when it turns a write down. Thrown by the stub rather than
// staged as the mock's return value: a rejected promise a mock still holds when
// vitest resets it reads to vitest as an unhandled rejection.
let rejection: Error | null = null

// What the page reads: `resolved` carries the entry the values come from — a
// wildcard until the path is materialized, its own name after — and
// `unresolved` is a name MediaMTX neither runs nor holds an entry for.
let result: unknown = { status: 'resolved', confName: 'all_others', conf: { record: true } }

// What every value on the page is measured against.
let defaults: unknown = null

// What the delete confirm reads to name what it would cut off. Idle by default.
let connections: unknown = { publisher: null, readers: [] }

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  pathConfig: () => result,
  pathDefaults: () => defaults,
  pathConnections: () => connections,
  deletePathConfig,
  updatePathConfig: (input) => {
    updatePathConfig(input)
    if (rejection)
      throw rejection
  },
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  defaults = null
  connections = { publisher: null, readers: [] }
  rejection = null
  vi.clearAllMocks()
})
afterAll(() => server.close())

type User = Awaited<ReturnType<typeof renderWithProviders>>['user']

async function renderPage(confName: string) {
  result = { status: 'resolved', confName, conf: { record: true } }
  const view = await renderWithProviders(<PathConfigPage name="stream1" />)
  await screen.findByRole('heading', { name: 'Path Config · stream1' })
  return view
}

describe('revert to inherited', () => {
  it('offers nothing to revert while the path tracks a wildcard entry', async () => {
    await renderPage('all_others')

    expect(await screen.findByText(/currently inherited from all_others/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revert to inherited' })).not.toBeInTheDocument()
  })

  it('offers the revert once the path has an entry of its own', async () => {
    await renderPage('stream1')

    expect(await screen.findByRole('button', { name: 'Revert to inherited' })).toBeInTheDocument()
  })

  it('deletes the entry only after the confirm', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Revert to inherited' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()

    await view.user.click(screen.getByRole('button', { name: 'Revert' }))

    expect(await screen.findByText('Reverted to inherited settings')).toBeInTheDocument()
    expect(deletePathConfig).toHaveBeenCalledWith(
      { name: 'stream1' } satisfies RpcInputs['config']['mediamtx']['deletePathConfig'],
    )
  })

  it('leaves the entry alone when the confirm is cancelled', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Revert to inherited' }))
    await view.user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()
  })
})

// MediaMTX drops an entry with live sessions on it and says nothing, so the
// confirm is the only warning there is — and it has to name what is attached
// rather than just report that something is.
describe('path deletion', () => {
  it('offers nothing to delete while the path tracks a wildcard entry', async () => {
    await renderPage('all_others')

    expect(await screen.findByText(/currently inherited from all_others/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete path' })).not.toBeInTheDocument()
  })

  it('deletes an idle path and returns to the catalog', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))
    await view.user.click(await screen.findByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Deleted stream1')).toBeInTheDocument()
    expect(deletePathConfig).toHaveBeenCalledWith(
      { name: 'stream1' } satisfies RpcInputs['config']['mediamtx']['deletePathConfig'],
    )
    expect(view.router.state.location.pathname).toBe('/config/mediamtx/paths')
  })

  it('names the publisher and the readers before deleting anything', async () => {
    connections = { publisher: 'rtspSession', readers: ['webRTCSession', 'hlsMuxer', 'webRTCSession'] }
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))

    expect(await screen.findByText('This path is in use right now')).toBeInTheDocument()
    expect(screen.getByText('Publishing over rtspSession')).toBeInTheDocument()
    expect(screen.getByText('3 readers connected over webRTCSession, hlsMuxer')).toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()
  })

  // Confirming before the answer lands would skip the warning entirely.
  it('holds the confirm until it knows what is connected', async () => {
    let land!: () => void
    connections = new Promise((resolve) => {
      land = () => resolve({ publisher: 'rtspSession', readers: [] })
    })
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))

    expect(await screen.findByText('Checking what is connected…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()

    land()

    expect(await screen.findByText('Publishing over rtspSession')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled()
  })

  it('leaves the path alone when the confirm is cancelled', async () => {
    connections = { publisher: 'rtspSession', readers: [] }
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Delete path' }))
    await view.user.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()
    expect(view.router.state.location.pathname).toBe('/')
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
    const { queryClient } = await renderAgainstDefaults({ record: true, recordPath: './recordings/%path/%Y' }, null)

    expect(await screen.findByLabelText('recordPath')).toBeInTheDocument()
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))
    expect(screen.queryByText('Inherited')).not.toBeInTheDocument()
    expect(screen.queryByText('Overridden')).not.toBeInTheDocument()
  })
})

// `source` is the one key on this page that isn't a per-path override of path
// defaults — it says where the stream comes from, and it is the field an
// operator actually retypes when a camera moves.
describe('editing the source', () => {
  async function renderWithSource(source: string) {
    result = { status: 'resolved', confName: 'stream1', conf: { record: true, source } }
    const view = await renderWithProviders(<PathConfigPage name="stream1" />)
    await screen.findByRole('heading', { name: 'Path Config · stream1' })
    return view
  }

  async function retypeSource(user: User, next: string) {
    const field = await screen.findByLabelText('source')
    await user.clear(field)
    await user.type(field, next)
    // The form validates on blur, so the message has to be reachable without
    // pressing a save button that is by then already disabled.
    await user.tab()
  }

  it('saves the new source as the path\'s own override', async () => {
    const view = await renderWithSource('rtsp://old.lan:554/live')

    await retypeSource(view.user, 'rtsp://new.lan:554/live')
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))

    await vi.waitFor(() => expect(updatePathConfig).toHaveBeenCalled())
    // Only the key that changed: everything else keeps tracking path defaults.
    expect(updatePathConfig).toHaveBeenCalledWith(
      {
        name: 'stream1',
        conf: { source: 'rtsp://new.lan:554/live' },
      } satisfies RpcInputs['config']['mediamtx']['updatePathConfig'],
    )
  })

  // The write is only half of it: a value the page then reads back as the old
  // one would look saved and be gone on the next visit.
  it('reads the saved source back on a fresh visit', async () => {
    const view = await renderWithSource('rtsp://old.lan:554/live')

    await retypeSource(view.user, 'rtsp://new.lan:554/live')
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))
    await vi.waitFor(() => expect(updatePathConfig).toHaveBeenCalled())

    // What MediaMTX holds for the path now, served to a fresh mount.
    const saved = updatePathConfig.mock.calls[0]![0].conf
    result = { status: 'resolved', confName: 'stream1', conf: { record: true, ...saved } }
    view.unmount()
    await renderWithProviders(<PathConfigPage name="stream1" />)

    expect(await screen.findByLabelText('source')).toHaveValue('rtsp://new.lan:554/live')
  })

  // MediaMTX takes three keywords or a URL in a scheme it can pull; anything
  // else comes back as a refused PATCH, which is a slow way to learn about a typo.
  it('rejects a source MediaMTX would refuse before sending anything', async () => {
    const view = await renderWithSource('rtsp://old.lan:554/live')

    await retypeSource(view.user, 'rtsp:/old.lan/live')

    expect(await within(screen.getByTestId('field-source')).findByText(/MediaMTX won't accept this/))
      .toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))
    expect(updatePathConfig).not.toHaveBeenCalled()
  })

  it('accepts the keywords MediaMTX takes in place of a URL', async () => {
    const view = await renderWithSource('rtsp://old.lan:554/live')

    await retypeSource(view.user, 'publisher')
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))

    await vi.waitFor(() => expect(updatePathConfig).toHaveBeenCalled())
    expect(updatePathConfig.mock.calls[0]?.[0].conf).toEqual({ source: 'publisher' })
  })

  // The mirror can only be as current as MediaMTX's own rule, so a rejection
  // still has to land on the field that caused it rather than in a toast.
  it('puts a server-side rejection on the field that caused it', async () => {
    rejection = new ORPCError('BAD_REQUEST', {
      message: 'invalid source: \'srt://cam.lan:8890\'',
    })
    const view = await renderWithSource('rtsp://old.lan:554/live')

    await retypeSource(view.user, 'srt://cam.lan:8890')
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))

    expect(await within(screen.getByTestId('field-source')).findByText(/invalid source/))
      .toBeInTheDocument()
  })

  // Path defaults holds no `source`, so there is no inherited value for one to
  // still match — a marker either way would claim a comparison we can't make.
  it('marks the source neither inherited nor overridden', async () => {
    defaults = { record: true, recordPath: './recordings/%path' }
    await renderWithSource('rtsp://old.lan:554/live')

    expect(await screen.findByLabelText('source')).toBeInTheDocument()
    expect(within(screen.getByTestId('field-source')).queryByText(/Inherited|Overridden/))
      .not
      .toBeInTheDocument()
    // The keys path defaults does hold are still marked.
    expect(within(screen.getByTestId('field-recordPath')).getByText(/Inherited|Overridden/))
      .toBeInTheDocument()
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
    // an offer to undo overrides would be true.
    expect(screen.queryByText(/Settings for this stream/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revert to inherited' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete path' })).not.toBeInTheDocument()
  })
})

// MediaMTX re-publishes a path to every `forward` destination. Its PATCH
// replaces the list wholesale, so whatever goes out has to be the whole list —
// including keys only a newer MediaMTX serves, which the form can't edit.
describe('forwarding', () => {
  async function renderWithForward(forward: unknown[]) {
    result = { status: 'resolved', confName: 'stream1', conf: { record: true, forward } }
    const view = await renderWithProviders(<PathConfigPage name="stream1" />)
    await screen.findByRole('heading', { name: 'Path Config · stream1' })
    return view
  }

  async function forwardSection() {
    const heading = await screen.findByRole('heading', { name: 'Forwarding' })
    return heading.closest('section')!
  }

  async function addDestination(user: User, index: number, dest: string) {
    await user.click(await screen.findByRole('button', { name: 'Add destination' }))
    await user.type(screen.getByLabelText(`Destination ${index}`), dest)
    // The form validates on blur, and the new row starts out empty and invalid.
    await user.tab()
  }

  async function save(user: User) {
    await user.click(screen.getByRole('button', { name: 'Save to server' }))
    await vi.waitFor(() => expect(updatePathConfig).toHaveBeenCalled())
  }

  it('saves a new destination as the whole list', async () => {
    const view = await renderWithForward([])

    await addDestination(view.user, 1, 'rtmp://example.com/live#secretkey')
    await save(view.user)

    expect(updatePathConfig).toHaveBeenCalledWith(
      {
        name: 'stream1',
        conf: { forward: [{ dest: 'rtmp://example.com/live#secretkey' }] },
      } satisfies RpcInputs['config']['mediamtx']['updatePathConfig'],
    )
  })

  // A slice can't be nulled through MediaMTX's PATCH, and an empty row is a
  // destination it would try to dial.
  it('sends an empty list when the last destination is removed', async () => {
    const view = await renderWithForward([{ dest: 'rtmp://example.com/live#k' }])

    await view.user.click(await screen.findByRole('button', { name: 'Remove destination 1' }))
    await save(view.user)

    expect(updatePathConfig).toHaveBeenCalledWith(
      { name: 'stream1', conf: { forward: [] } } satisfies RpcInputs['config']['mediamtx']['updatePathConfig'],
    )
  })

  it('sends keys it can\'t edit back unchanged', async () => {
    const existing = {
      dest: 'whip://example.com/whip',
      destFingerprint: 'ab:cd',
      moqTransport: 'quic',
      whipBearerToken: '',
    }
    const view = await renderWithForward([existing])

    await addDestination(view.user, 2, 'srt://example.com:8890')
    await save(view.user)

    expect(updatePathConfig.mock.calls[0]?.[0].conf).toEqual({
      forward: [existing, { dest: 'srt://example.com:8890' }],
    })
  })

  // Destinations carry stream keys, and MediaMTX hands them back in full.
  it('masks a destination until Show is pressed', async () => {
    const view = await renderWithForward([{ dest: 'rtmp://example.com/live#k' }])

    const input = await screen.findByLabelText('Destination 1')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('autocomplete', 'off')

    await view.user.click(screen.getByRole('button', { name: 'Show destination 1' }))

    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide destination 1' })).toBeInTheDocument()
  })

  // Writing `forward` hot-reloads the path; nothing is restarted.
  it('warns about plaintext storage, not about a restart', async () => {
    await renderWithForward([])

    const section = await forwardSection()
    // The plaintext notice is the section's only note: a restart warning would
    // be a second one.
    const notes = within(section).getAllByRole('note')
    expect(notes).toHaveLength(1)
    expect(notes[0]).toHaveTextContent(/stores these URLs, stream keys included, in plaintext/)
  })

  it('places Forwarding directly after Source in the rail', async () => {
    await renderWithForward([])

    const [rail] = await screen.findAllByRole('navigation', { name: 'Config sections' })
    expect(rail).toBeDefined()
    const labels = within(rail!).getAllByRole('button').map(b => b.textContent)
    expect(labels.slice(0, 2)).toEqual(['Source', 'Forwarding'])
  })
})
