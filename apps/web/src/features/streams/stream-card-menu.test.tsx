import type { RecordState } from '@connect/contract'
import type { PublishTarget } from '@/lib/publish'
import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { StreamCard } from './stream-card'

// The actions menu is Radix, driven by real pointer events, and it fires oRPC
// mutations. This is the suite that proves both halves of ADR 0005's component
// layer work: Radix overlays in happy-dom, and MSW serving /rpc through the
// real RPCHandler over a contract-typed stub router.

// Typed from the contract, so the `toHaveBeenCalledWith` literals below are
// checked against the real procedure inputs — rename a field in
// packages/contract and these assertions stop compiling.
const snapshot = vi.fn<(input: RpcInputs['streams']['snapshot']) => void>()
const updatePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['updatePathConfig']) => void | Promise<void>>()

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  snapshot,
  updatePathConfig,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

async function openMenu(recordState: RecordState = 'off', publishTargets: PublishTarget[] = []) {
  const view = await renderWithProviders(
    <StreamCard
      streamName="stream1"
      remoteMediaMtxUrl="http://localhost"
      publishTargets={publishTargets}
      playbackMode="auto"
      recordState={recordState}
    />,
  )
  await view.user.click(screen.getByRole('button', { name: 'Stream actions' }))
  return view
}

describe('stream actions menu', () => {
  it('opens with the actions a card offers', async () => {
    await openMenu()

    expect(screen.getByRole('menuitem', { name: /View recordings/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Take snapshot/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Edit path config/ })).toBeInTheDocument()
  })

  // Replaces the two streams.spec.ts deep-link tests, which clicked the item and
  // then asserted the URL a real navigation landed on. The href IS the behaviour;
  // navigating to prove it needed a browser and a live MediaMTX to render the
  // destination page.
  it('deep-links to the stream\'s own path config', async () => {
    await openMenu()

    expect(screen.getByRole('menuitem', { name: /Edit path config/ })).toHaveAttribute(
      'href',
      '/config/mediamtx/paths/stream1',
    )
  })

  it('deep-links straight to the hooks section', async () => {
    await openMenu()

    // The `section` search param is what scrolls the long config page to hooks;
    // without it the item lands at the top and the action is indistinguishable
    // from "Edit path config".
    expect(screen.getByRole('menuitem', { name: /Edit hooks/ })).toHaveAttribute(
      'href',
      '/config/mediamtx/paths/stream1?section=pathHooks',
    )
  })

  it('deep-links to the stream\'s recordings', async () => {
    await openMenu()

    expect(screen.getByRole('menuitem', { name: /View recordings/ })).toHaveAttribute(
      'href',
      '/recordings/stream1',
    )
  })

  it('reports the current record state in the menu', async () => {
    await openMenu('on')

    expect(screen.getByRole('menuitem', { name: /Record.*ON/ })).toBeInTheDocument()
  })

  it('reports record OFF when the stream is not recording', async () => {
    await openMenu('off')

    expect(screen.getByRole('menuitem', { name: /Record.*OFF/ })).toBeInTheDocument()
  })

  // Flipping a state we couldn't read would be a guess at what it's flipping —
  // and the guess that turns recording off is the expensive one.
  it('says so and offers no flip when the record state is unknown', async () => {
    await openMenu('unknown')

    const item = screen.getByRole('menuitem', { name: /Record.*UNKNOWN/ })
    expect(item).toHaveAttribute('aria-disabled', 'true')
  })

  // Every source protocol disabled leaves nothing to copy — offering the action
  // would put an empty clipboard behind a success toast.
  it('disables Copy publish URLs when the server serves no publish protocol', async () => {
    await openMenu('off', [])

    expect(screen.getByRole('menuitem', { name: /Copy publish URLs/ }))
      .toHaveAttribute('aria-disabled', 'true')
  })

  it('offers Copy publish URLs when the server serves one', async () => {
    await openMenu('off', [{ protocol: 'RTSP', prefix: 'rtsp://cam.lan:8554/' }])

    expect(screen.getByRole('menuitem', { name: /Copy publish URLs/ }))
      .not
      .toHaveAttribute('aria-disabled')
  })
})

describe('menu actions reach the API', () => {
  it('captures a snapshot for this stream and confirms it', async () => {
    const view = await openMenu()

    await view.user.click(screen.getByRole('menuitem', { name: /Take snapshot/ }))

    expect(await screen.findByText('Snapshot captured')).toBeInTheDocument()
    expect(snapshot).toHaveBeenCalledWith(
      { name: 'stream1' } satisfies RpcInputs['streams']['snapshot'],
    )
  })

  // Writes this stream's own override and nothing else: patching path defaults
  // would start or stop recording for every stream on the server (ADR 0002).
  it('toggles record by writing only this stream\'s override', async () => {
    const view = await openMenu('off')

    await view.user.click(screen.getByRole('menuitem', { name: /Record/ }))

    expect(updatePathConfig).toHaveBeenCalledWith(
      { name: 'stream1', conf: { record: true } } satisfies RpcInputs['config']['mediamtx']['updatePathConfig'],
    )
  })

  it('turns record off from an on state', async () => {
    const view = await openMenu('on')

    await view.user.click(screen.getByRole('menuitem', { name: /Record/ }))

    expect(updatePathConfig).toHaveBeenCalledWith(
      { name: 'stream1', conf: { record: false } } satisfies RpcInputs['config']['mediamtx']['updatePathConfig'],
    )
  })
})

// The `recordState` prop is the settled `streams.list` query. Nothing here
// changes it, so it stays OFF for the whole test — which is the point: what the
// card shows mid-flight can only be coming from the mutation.
describe('the record toggle while the write is in flight', () => {
  /** Holds the stub's write open so the assertions run before the server answers. */
  function heldWrite() {
    let settle!: { resolve: () => void, reject: (error: Error) => void }
    const held = new Promise<void>((resolve, reject) => {
      settle = { resolve, reject }
    })
    updatePathConfig.mockImplementationOnce(() => held)
    return settle
  }

  async function reopenMenu(view: Awaited<ReturnType<typeof openMenu>>) {
    // Radix leaves `pointer-events: none` on the body until the menu is gone,
    // and userEvent refuses to click through it.
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await view.user.click(screen.getByRole('button', { name: 'Stream actions' }))
  }

  it('shows the state it asked for before the server answers', async () => {
    const write = heldWrite()
    const view = await openMenu('off')

    await view.user.click(screen.getByRole('menuitem', { name: /Record/ }))

    expect(await screen.findByText(/● REC/)).toBeInTheDocument()
    await reopenMenu(view)
    expect(screen.getByRole('menuitem', { name: /Record.*ON/ })).toBeInTheDocument()

    write.resolve()
  })

  it('offers no second flip until the first one lands', async () => {
    const write = heldWrite()
    const view = await openMenu('off')

    await view.user.click(screen.getByRole('menuitem', { name: /Record/ }))
    await reopenMenu(view)

    // Reopening inside the round trip is the only way to double-click this, and
    // a second write computed from the stale OFF would race the first to the
    // opposite value.
    expect(screen.getByRole('menuitem', { name: /Record/ })).toHaveAttribute('aria-disabled', 'true')

    write.resolve()
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Record/ })).not.toHaveAttribute('aria-disabled'))
    expect(updatePathConfig).toHaveBeenCalledTimes(1)
  })

  it('snaps back to the settled state when the write is rejected', async () => {
    const write = heldWrite()
    const view = await openMenu('off')

    await view.user.click(screen.getByRole('menuitem', { name: /Record/ }))
    expect(await screen.findByText(/● REC/)).toBeInTheDocument()

    write.reject(new Error('MediaMTX rejected the write'))

    expect(await screen.findByText('Couldn\'t change recording')).toBeInTheDocument()
    expect(screen.queryByText(/● REC/)).not.toBeInTheDocument()
  })
})
