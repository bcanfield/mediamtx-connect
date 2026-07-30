import type { RecordState } from '@connect/contract'
import type { PublishTarget } from '@/lib/publish'
import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
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
const updatePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['updatePathConfig']) => void>()

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
