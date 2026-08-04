import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathConfigPage } from './path-config-page'

// Materializing is one-way from the app's side unless the page can delete the
// entry again, so what this suite covers is the way back: the affordance shows
// up only for a path that has an entry of its own, and only the confirm deletes.
const deletePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['deletePathConfig']) => void>()

// What the page reads: `resolved` carries the entry the values come from — a
// wildcard until the path is materialized, its own name after — plus the tracks
// the path is publishing; `unresolved` is a name MediaMTX neither runs nor
// holds an entry for.
let result: unknown = { status: 'resolved', confName: 'all_others', conf: { record: true }, codecs: [] }

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  pathConfig: () => result,
  deletePathConfig,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

async function renderPage(confName: string, codecs: string[] = []) {
  result = { status: 'resolved', confName, conf: { record: true }, codecs }
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

// MediaMTX routes one source to many readers and never re-encodes, so the same
// stream plays over one protocol and not another. What this suite guards is
// that the page says *which* codec is responsible rather than just colouring a
// cell — the whole point of the matrix over a badge.
describe('codec compatibility matrix', () => {
  it('marks every protocol green for a mix all of them carry', async () => {
    await renderPage('all_others', ['H264', 'Opus'])

    expect(await screen.findByRole('heading', { name: 'Codec compatibility' })).toBeInTheDocument()
    expect(screen.getAllByText('Plays')).toHaveLength(5)
    expect(screen.queryByText('Partial')).not.toBeInTheDocument()
    expect(screen.queryByText('Won\'t play')).not.toBeInTheDocument()
    // Nothing is dropped, so there is nothing to re-encode.
    const transcode = screen.queryByRole('link', { name: 'Re-encode the source with FFmpeg' })
    expect(transcode).not.toBeInTheDocument()
  })

  // The silent-stream case: WebRTC's audio set is Opus/G722/G711, so an AAC
  // source reaches a browser as picture with no sound.
  it('names the codec behind a partial verdict instead of only tinting it', async () => {
    await renderPage('all_others', ['H264', 'MPEG-4 Audio'])

    expect(await screen.findByText('Partial')).toBeInTheDocument()
    expect(screen.getByText('WebRTC drops MPEG-4 Audio')).toBeInTheDocument()
    expect(screen.getByText('WebRTC carries H264')).toBeInTheDocument()
    expect(screen.getByText('WebRTC readers get this stream without MPEG-4 Audio.'))
      .toBeInTheDocument()
  })

  // A protocol that can carry nothing has a different answer from one that
  // drops the audio, and an operator who reads "partial" would go looking for a
  // picture that is never coming.
  it('explains a red cell as nothing to serve, not as a partial stream', async () => {
    await renderPage('all_others', ['M-JPEG'])

    expect(await screen.findByText('RTMP carries none of these tracks, so it has nothing to serve.'))
      .toBeInTheDocument()
    expect(screen.getAllByText('Won\'t play')).toHaveLength(4)
    // RTSP forwards RTP as it arrives, so it is the one reader that still works.
    expect(screen.getByText('RTSP carries M-JPEG')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Re-encode the source with FFmpeg' }))
      .toHaveAttribute('href', expect.stringContaining('remuxing-reencoding-compression'))
  })

  // MediaMTX only knows a path's codecs while a source is connected. A matrix
  // computed off no tracks would read green everywhere and claim a stream that
  // isn't there plays fine.
  it('says there are no tracks rather than showing an empty green matrix', async () => {
    await renderPage('all_others', [])

    expect(await screen.findByText(/no tracks to check/)).toBeInTheDocument()
    expect(screen.queryByText('Plays')).not.toBeInTheDocument()
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
  })
})
