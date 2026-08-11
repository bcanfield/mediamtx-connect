import type { MediaMtxPath } from './mediamtx'
import { call } from '@orpc/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { captureSnapshot } from './jobs'
import { mediaMtxApi, MediaMtxError } from './mediamtx'
import { latestScreenshotMtimeFor } from './recordings-fs'
import { router } from './router'

// Factories (not automock) so the real modules never load — config-store pulls in
// env.ts, which validates process.env at import time.
vi.mock('./config-store', () => ({ getAppConfig: vi.fn(), updateAppConfig: vi.fn() }))
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
// The real MediaMtxError, so the add handler's `instanceof` narrowing is the
// one that ships. `mediamtx.ts` imports nothing but types, so loading it here
// costs nothing.
vi.mock('./mediamtx', async (importActual) => {
  const actual = await importActual<typeof import('./mediamtx')>()
  return { mediaMtxApi: vi.fn(), MediaMtxError: actual.MediaMtxError }
})
vi.mock('./jobs', () => ({ captureSnapshot: vi.fn() }))
// The real module, with the snapshot read swappable: one test needs it to fail
// the way a disk fault would.
vi.mock('./recordings-fs', async (importActual) => {
  const actual = await importActual<typeof import('./recordings-fs')>()
  return { ...actual, latestScreenshotMtimeFor: vi.fn(actual.latestScreenshotMtimeFor) }
})

const CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/rec',
  screenshotsDirectory: '/shots',
}

const api = {
  pathsList: vi.fn(),
  pathsGet: vi.fn(),
  configGlobalGet: vi.fn(),
  configPathsList: vi.fn(),
  configPathGet: vi.fn(),
  configPathAdd: vi.fn(),
  configPathPatch: vi.fn(),
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

    expect(state.status === 'connected' && state.streams.map(s => ({ name: s.name, recordState: s.recordState }))).toEqual([
      { name: 'stream1', recordState: 'on' },
      { name: 'stream2', recordState: 'on' },
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

    expect(state.status === 'connected' && state.streams.map(s => s.recordState)).toEqual(['on', 'off'])
  })

  // "Couldn't read the entry" is not "not recording": the entry can 404 because
  // it was deleted between the paths list and this read, while MediaMTX keeps
  // writing files for the path.
  it('reports record state as unknown when the config entry is gone', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1') })
    api.configPathGet.mockResolvedValue(null)

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams[0]?.recordState).toBe('unknown')
  })

  it('reports record state as unknown when the config read fails', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1') })
    api.configPathGet.mockRejectedValue(new Error('MediaMTX GET /config/paths/get/all_others responded 500'))

    const state = await call(router.streams.list, undefined as never)

    expect(state.status === 'connected' && state.streams[0]?.recordState).toBe('unknown')
  })

  // One flaky config read used to blank the whole grid to "Can't reach
  // MediaMTX" even though paths/list and the global conf both answered.
  it('still lists the streams paths/list returned when a config read fails', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1', 'stream2') })
    api.configPathGet.mockRejectedValue(new Error('MediaMTX GET /config/paths/get/all_others responded 500'))

    const state = await call(router.streams.list, undefined as never)

    expect(state.status).toBe('connected')
    expect(state.status === 'connected' && state.streams.map(s => s.name)).toEqual(['stream1', 'stream2'])
  })

  it('reports an unreachable MediaMTX when the paths list itself fails', async () => {
    api.pathsList.mockRejectedValue(new Error('fetch failed'))

    const state = await call(router.streams.list, undefined as never)

    expect(state).toEqual({
      status: 'connection-error',
      mediaMtxUrl: CONFIG.mediaMtxUrl,
      mediaMtxApiPort: CONFIG.mediaMtxApiPort,
    })
  })
})

describe('streams.snapshot', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('captures the requested stream on demand', async () => {
    vi.mocked(captureSnapshot).mockResolvedValue()

    await call(router.streams.snapshot, { name: 'front-door' })

    expect(captureSnapshot).toHaveBeenCalledWith('front-door')
  })

  it('surfaces a capture failure as an error', async () => {
    vi.mocked(captureSnapshot).mockRejectedValue(new Error('ffmpeg exited 1'))

    await expect(call(router.streams.snapshot, { name: 'front-door' })).rejects.toThrow()
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

  // Snapshot mtimes come off our own disk. A screenshots directory that went
  // unreadable is a local fault and has to surface as one — reporting it as
  // "Can't reach MediaMTX" points the operator at a healthy server.
  it('does not blame MediaMTX when reading a snapshot mtime fails', async () => {
    api.pathsList.mockResolvedValue({ items: wildcardPaths('stream1') })
    vi.mocked(latestScreenshotMtimeFor).mockImplementation(() => {
      throw new Error('EIO: i/o error, stat')
    })

    // Rejects rather than resolving: `connection-error` is reserved for MediaMTX.
    await expect(call(router.streams.list, undefined as never)).rejects.toThrow()
  })
})

describe('config.mediamtx.listPaths', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('lists every config entry with its source, flagging the regex ones', async () => {
    api.configPathsList.mockResolvedValue({
      items: [
        { name: 'front-door', source: 'rtsp://cam.lan/stream' },
        { name: '~^cam[0-9]+$', source: 'publisher' },
      ],
    })
    api.pathsList.mockResolvedValue({ items: [] })

    const state = await call(router.config.mediamtx.listPaths, undefined as never)

    expect(state.status === 'connected' && state.paths).toEqual([
      { name: 'front-door', source: 'rtsp://cam.lan/stream', isRegex: false, active: false },
      { name: '~^cam[0-9]+$', source: 'publisher', isRegex: true, active: false },
    ])
  })

  // Every static entry has a runtime path whether or not anything is publishing
  // to it, so "has a runtime path" would mark all of them active.
  it('calls an entry active only while a path it backs is ready', async () => {
    api.configPathsList.mockResolvedValue({
      items: [{ name: 'front-door' }, { name: 'garage' }],
    })
    api.pathsList.mockResolvedValue({
      items: [
        { name: 'front-door', confName: 'front-door', ready: true },
        { name: 'garage', confName: 'garage', ready: false },
      ],
    })

    const state = await call(router.config.mediamtx.listPaths, undefined as never)

    expect(state.status === 'connected' && state.paths.map(p => [p.name, p.active])).toEqual([
      ['front-door', true],
      ['garage', false],
    ])
  })

  // A regex entry is never a runtime path itself — the paths it covers name it
  // as their confName, so that is the only way it can read as active.
  it('calls a regex entry active when one of the paths it backs is ready', async () => {
    api.configPathsList.mockResolvedValue({ items: [{ name: '~^cam[0-9]+$' }] })
    api.pathsList.mockResolvedValue({
      items: [
        { name: 'cam1', confName: '~^cam[0-9]+$', ready: false },
        { name: 'cam2', confName: '~^cam[0-9]+$', ready: true },
      ],
    })

    const state = await call(router.config.mediamtx.listPaths, undefined as never)

    expect(state.status === 'connected' && state.paths[0]?.active).toBe(true)
  })

  it('reports an unreachable server rather than an empty catalog', async () => {
    api.configPathsList.mockRejectedValue(new Error('fetch failed'))
    api.pathsList.mockResolvedValue({ items: [] })

    const state = await call(router.config.mediamtx.listPaths, undefined as never)

    expect(state).toEqual({
      status: 'connection-error',
      mediaMtxUrl: CONFIG.mediaMtxUrl,
      mediaMtxApiPort: CONFIG.mediaMtxApiPort,
    })
  })
})

describe('config.mediamtx.addPath', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('creates the entry with the composed source and the chosen transport', async () => {
    await call(router.config.mediamtx.addPath, {
      name: 'front-door',
      source: 'rtsp://admin:hunter2@cam.lan:554/live',
      rtspTransport: 'tcp',
    })

    expect(api.configPathAdd).toHaveBeenCalledWith('front-door', {
      source: 'rtsp://admin:hunter2@cam.lan:554/live',
      rtspTransport: 'tcp',
    })
  })

  // `automatic` is what an entry without the key already does, so writing it
  // would pin a value the path would otherwise keep inheriting.
  it('leaves rtspTransport off when the wizard sent none', async () => {
    await call(router.config.mediamtx.addPath, {
      name: 'front-door',
      source: 'rtsp://cam.lan:554/live',
    })

    expect(api.configPathAdd).toHaveBeenCalledWith('front-door', {
      source: 'rtsp://cam.lan:554/live',
      rtspTransport: undefined,
    })
  })

  // A rejected create is the user's to fix, and only MediaMTX knows which part
  // it disliked — a generic "failed" leaves them guessing at a duplicate name.
  it('passes MediaMTX\'s own reason through on a rejected create', async () => {
    api.configPathAdd.mockRejectedValue(
      new MediaMtxError(400, 'path already exists', 'POST /config/paths/add/front-door'),
    )

    await expect(call(router.config.mediamtx.addPath, {
      name: 'front-door',
      source: 'rtsp://cam.lan:554/live',
    })).rejects.toThrow('path already exists')
  })

  it('does not claim a reason when the server gave none', async () => {
    api.configPathAdd.mockRejectedValue(new Error('fetch failed'))

    await expect(call(router.config.mediamtx.addPath, {
      name: 'front-door',
      source: 'rtsp://cam.lan:554/live',
    })).rejects.toThrow('Failed to add path')
  })
})

describe('config.mediamtx.updatePathConfig', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('patches the path\'s own entry with just the keys that changed', async () => {
    api.configPathGet.mockResolvedValue({ source: 'rtsp://old.lan:554/live' })

    await call(router.config.mediamtx.updatePathConfig, {
      name: 'front-door',
      conf: { source: 'rtsp://new.lan:554/live' },
    })

    expect(api.configPathPatch).toHaveBeenCalledWith('front-door', {
      source: 'rtsp://new.lan:554/live',
    })
  })

  // The reason is the only thing that says which field to go back to; a generic
  // "failed" would leave the form with no way to point at one.
  it('passes MediaMTX\'s own reason through on a refused write', async () => {
    api.configPathGet.mockResolvedValue({ source: 'publisher' })
    api.configPathPatch.mockRejectedValue(
      new MediaMtxError(400, 'invalid source: \'nope\'', 'PATCH /config/paths/patch/front-door'),
    )

    await expect(call(router.config.mediamtx.updatePathConfig, {
      name: 'front-door',
      conf: { source: 'nope' },
    })).rejects.toThrow('invalid source')
  })

  it('does not claim a reason when the server gave none', async () => {
    api.configPathGet.mockRejectedValue(new Error('fetch failed'))

    await expect(call(router.config.mediamtx.updatePathConfig, {
      name: 'front-door',
      conf: { source: 'publisher' },
    })).rejects.toThrow('Failed to update path config')
  })
})

describe('config.mediamtx.getPathConfig', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('resolves a publishing path through the confName its runtime path reports', async () => {
    api.pathsGet.mockResolvedValue(wildcardPaths('stream1')[0])
    api.configPathGet.mockResolvedValue({ record: true })

    const result = await call(router.config.mediamtx.getPathConfig, { name: 'stream1' })

    expect(result).toEqual({ status: 'resolved', confName: 'all_others', conf: { record: true } })
    // Not `stream1` — a wildcard-backed path has no entry under its own name.
    expect(api.configPathGet).toHaveBeenCalledWith('all_others')
  })

  it('reports unresolved when there is no runtime path and no entry of its own', async () => {
    // Both 404 — `requestOrNull` turns that into null rather than throwing.
    api.pathsGet.mockResolvedValue(null)
    api.configPathGet.mockResolvedValue(null)

    const result = await call(router.config.mediamtx.getPathConfig, { name: 'stopped' })

    // Distinct from null: MediaMTX answered, it just has nothing to resolve.
    expect(result).toEqual({ status: 'unresolved' })
  })

  it('returns null when MediaMTX is unreachable', async () => {
    api.pathsGet.mockRejectedValue(new Error('fetch failed'))

    const result = await call(router.config.mediamtx.getPathConfig, { name: 'stream1' })

    expect(result).toBeNull()
  })
})

describe('config.mediamtx.getPathHealth', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('reports the counters, tracks and sessions of a ready path', async () => {
    api.pathsGet.mockResolvedValue({
      name: 'stream1',
      ready: true,
      readyTime: '2026-07-16T10:00:00Z',
      source: { type: 'rtspSession', id: 'a' },
      readers: [{ type: 'webRTCSession', id: 'b' }, { type: 'hlsMuxer', id: 'c' }],
      tracks2: [
        { codec: 'H264', codecProps: { width: 1920, height: 1080 } },
        { codec: 'MPEG-4 Audio', codecProps: null },
      ],
      bytesReceived: 4096,
      bytesSent: 2048,
      inboundFramesInError: 7,
    })

    const result = await call(router.config.mediamtx.getPathHealth, { name: 'stream1' })

    expect(result).toEqual({
      status: 'live',
      readyTime: '2026-07-16T10:00:00Z',
      publisher: 'rtspSession',
      readers: ['webRTCSession', 'hlsMuxer'],
      tracks: [
        { codec: 'H264', resolution: '1920×1080' },
        { codec: 'MPEG-4 Audio', resolution: null },
      ],
      bytesReceived: 4096,
      bytesSent: 2048,
      framesInError: 7,
    })
  })

  // Older servers serve the bare codec list and no error counter. Both are
  // worth degrading for rather than dropping the panel.
  it('falls back to the bare codec list, and to no error counter', async () => {
    api.pathsGet.mockResolvedValue({
      name: 'stream1',
      ready: true,
      readyTime: '2026-07-16T10:00:00Z',
      tracks: ['H264'],
    })

    const result = await call(router.config.mediamtx.getPathHealth, { name: 'stream1' })

    expect(result).toMatchObject({
      status: 'live',
      tracks: [{ codec: 'H264', resolution: null }],
      // Not zero: a counter the server never sent is not a counter at zero.
      framesInError: null,
      bytesReceived: 0,
      bytesSent: 0,
    })
  })

  it('reports a configured path MediaMTX is not running as idle', async () => {
    api.pathsGet.mockResolvedValue(null)

    const result = await call(router.config.mediamtx.getPathHealth, { name: 'stopped' })

    expect(result).toEqual({ status: 'idle' })
  })

  // A runtime path exists the moment MediaMTX holds an entry for it; it is
  // `ready` only once something publishes. Idle, not live with empty counters.
  it('reports a runtime path that is not ready as idle', async () => {
    api.pathsGet.mockResolvedValue({ name: 'stream1', ready: false, readyTime: null })

    const result = await call(router.config.mediamtx.getPathHealth, { name: 'stream1' })

    expect(result).toEqual({ status: 'idle' })
  })

  // Distinct from idle: a server that didn't answer says nothing about whether
  // the path is up, and the panel says so rather than claiming it is down.
  it('returns null when MediaMTX is unreachable', async () => {
    api.pathsGet.mockRejectedValue(new Error('fetch failed'))

    const result = await call(router.config.mediamtx.getPathHealth, { name: 'stream1' })

    expect(result).toBeNull()
  })
})

describe('config.mediamtx.getPathConnections', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('names the publisher and every reader by session type', async () => {
    api.pathsGet.mockResolvedValue({
      name: 'stream1',
      source: { type: 'rtspSession', id: 'a' },
      readers: [{ type: 'webRTCSession', id: 'b' }, { type: 'hlsMuxer', id: 'c' }],
    })

    const result = await call(router.config.mediamtx.getPathConnections, { name: 'stream1' })

    expect(result).toEqual({ publisher: 'rtspSession', readers: ['webRTCSession', 'hlsMuxer'] })
  })

  // A configured path that nothing is publishing to has no runtime path at all,
  // and that is an idle path rather than an unanswerable question.
  it('reports an idle path for a name MediaMTX is not running', async () => {
    api.pathsGet.mockResolvedValue(null)

    const result = await call(router.config.mediamtx.getPathConnections, { name: 'stopped' })

    expect(result).toEqual({ publisher: null, readers: [] })
  })

  // Distinct from idle: a warning we couldn't build is not a path with nothing
  // on it, and the confirm says so rather than implying the delete is safe.
  it('returns null when MediaMTX is unreachable', async () => {
    api.pathsGet.mockRejectedValue(new Error('fetch failed'))

    const result = await call(router.config.mediamtx.getPathConnections, { name: 'stream1' })

    expect(result).toBeNull()
  })
})
