import type { MediaMtxPath } from './mediamtx'
import { call } from '@orpc/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { mediaMtxApi } from './mediamtx'
import { router } from './router'

// Factories (not automock) so the real modules never load — config-store pulls in
// env.ts, which validates process.env at import time.
vi.mock('./config-store', () => ({ getAppConfig: vi.fn(), updateAppConfig: vi.fn() }))
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('./mediamtx', () => ({ mediaMtxApi: vi.fn() }))

const CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/rec',
  screenshotsDirectory: '/shots',
}

const api = {
  pathsList: vi.fn(),
  configGlobalGet: vi.fn(),
  configPathGet: vi.fn(),
}

/** Every stream is wildcard-backed by `all_others` — the stock setup (ADR 0002). */
function wildcardPaths(...names: string[]): MediaMtxPath[] {
  return names.map(name => ({ name, confName: 'all_others', readyTime: '2026-07-16T10:00:00Z' }))
}

describe('streams.list record state', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
    api.configGlobalGet.mockResolvedValue({ hlsAddress: ':8888' })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('reports a stream as recording when only path defaults enable it', async () => {
    // The stock setup: recording is on in path defaults and no stream overrides
    // it. MediaMTX resolves defaults into the wildcard entry it serves, so an
    // inherited `true` has to surface as recording rather than off.
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1', 'stream2') })
    api.configPathGet.mockResolvedValue({ record: true })

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams.map(s => ({ name: s.name, recording: s.recording }))).toEqual([
      { name: 'stream1', recording: true },
      { name: 'stream2', recording: true },
    ])
  })

  it('reads one config entry per distinct confName, not one per stream', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1', 'stream2', 'stream3') })
    api.configPathGet.mockResolvedValue({ record: true })

    await call(router.streams.list, undefined as never)

    expect(api.configPathGet.mock.calls).toEqual([['all_others']])
  })

  it('gives a stream with its own entry that entry\'s record state', async () => {
    api.pathsList.mockResolvedValue({
      items: [
        ...wildcardPaths('stream1'),
        { name: 'stream2', confName: 'stream2', readyTime: null },
      ],
    })
    api.configPathGet.mockImplementation(async (name: string) =>
      name === 'stream2' ? { record: false } : { record: true },
    )

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams.map(s => s.recording)).toEqual([true, false])
  })
})

describe('streams.list card metadata', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
    api.configGlobalGet.mockResolvedValue({ hlsAddress: ':8888' })
    api.configPathGet.mockResolvedValue({ record: false })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('carries the codecs and viewer count the path list already returns', async () => {
    api.pathsList.mockResolvedValue({
      items: [{
        ...wildcardPaths('stream1')[0],
        tracks: ['H264', 'MPEG-4 Audio'],
        readers: [{ type: 'hlsMuxer', id: 'a' }, { type: 'webRTCSession', id: 'b' }],
      }],
    })

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams[0]).toMatchObject({
      codecs: ['H264', 'MPEG-4 Audio'],
      viewers: 2,
    })
  })

  it('reports no codecs and no viewers for a path publishing neither', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1') })

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams[0]).toMatchObject({
      codecs: [],
      viewers: 0,
    })
  })

  it('reports no snapshot age for a stream our capture job has never written', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1') })

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams[0]?.snapshotMtime).toBeNull()
  })
})
