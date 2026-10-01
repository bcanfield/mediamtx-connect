import type { SessionProtocol } from '@connect/contract'
import type { MediaMtxPath, MediaMtxSessionList } from './mediamtx'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { call } from '@orpc/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { captureSnapshot } from './jobs'
import { logger } from './logger'
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
// costs nothing. The playback client is real too: the timeline tests stub
// `fetch` for the playback server, so its URL and 404 handling are the shipped ones.
vi.mock('./mediamtx', async (importActual) => {
  const actual = await importActual<typeof import('./mediamtx')>()
  return {
    mediaMtxApi: vi.fn(),
    mediaMtxPlayback: actual.mediaMtxPlayback,
    MediaMtxError: actual.MediaMtxError,
  }
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
  info: vi.fn(),
  pathsList: vi.fn(),
  pathsGet: vi.fn(),
  configGlobalGet: vi.fn(),
  configPathsList: vi.fn(),
  configPathGet: vi.fn(),
  configPathAdd: vi.fn(),
  configPathPatch: vi.fn(),
  configPathDefaultsGet: vi.fn(),
  configGlobalPatch: vi.fn(),
  configPathDefaultsPatch: vi.fn(),
  sessionsList: vi.fn(),
  sessionsKick: vi.fn(),
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

    await expect(call(router.streams.snapshot, { name: 'front-door' })).rejects.toThrow('Failed to capture snapshot')
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
    await expect(call(router.streams.list, undefined as never)).rejects.toThrow('EIO: i/o error, stat')
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

// The whole-form scopes refuse the same way a path does, and the form needs the
// reason just as much to put it back on the field.
describe.each([
  {
    proc: 'updateGlobal',
    method: 'configGlobalPatch',
    save: () => call(router.config.mediamtx.updateGlobal, {}),
    fallback: 'Failed to update global config',
  },
  {
    proc: 'updatePathDefaults',
    method: 'configPathDefaultsPatch',
    save: () => call(router.config.mediamtx.updatePathDefaults, {}),
    fallback: 'Failed to update path defaults',
  },
] as const)('config.mediamtx.$proc', ({ method, save, fallback }) => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('passes MediaMTX\'s own reason through as BAD_REQUEST on a refused write', async () => {
    const reason = '\'udpMaxPayloadSize\' must be less than 1472'
    api[method].mockRejectedValue(new MediaMtxError(400, reason, 'PATCH /config/x/patch'))

    await expect(save()).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: reason,
    })
  })

  it('stays INTERNAL_SERVER_ERROR when the failure is not a refusal', async () => {
    api[method].mockRejectedValue(new Error('fetch failed'))

    await expect(save()).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: fallback,
    })
  })
})

describe('recordings.timeline', () => {
  // The playback server is reached over HTTP, not through the mocked API client.
  const fetchMock = vi.fn<typeof fetch>()

  const DAY = {
    streamName: 'stream1',
    start: new Date('2026-03-14T00:00:00Z'),
    end: new Date('2026-03-15T00:00:00Z'),
  }

  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
    vi.stubGlobal('fetch', fetchMock)
    api.configGlobalGet.mockResolvedValue({ playback: true, playbackAddress: ':9996' })
    api.pathsGet.mockResolvedValue(wildcardPaths('stream1')[0])
    api.configPathGet.mockResolvedValue({ recordFormat: 'fmp4' })
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })

  it('is unavailable while the playback server is off', async () => {
    api.configGlobalGet.mockResolvedValue({ playback: false })

    const result = await call(router.recordings.timeline, DAY)

    expect(result).toEqual({ status: 'unavailable', playbackEnabled: false, recordFormat: 'fmp4' })
  })

  // The playback server refuses MPEG-TS outright, so asking it is pointless.
  it('is unavailable when the path records MPEG-TS, without asking the playback server', async () => {
    api.configPathGet.mockResolvedValue({ recordFormat: 'mpegts' })

    const result = await call(router.recordings.timeline, DAY)

    expect(result).toEqual({ status: 'unavailable', playbackEnabled: true, recordFormat: 'mpegts' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // A wildcard-backed path has no entry under its own name (ADR 0002).
  it('reads the format off the entry the runtime path names as its confName', async () => {
    api.configPathGet.mockImplementation(async (name: string) =>
      name === 'all_others' ? { recordFormat: 'mpegts' } : null,
    )

    const result = await call(router.recordings.timeline, DAY)

    expect(api.configPathGet).toHaveBeenCalledWith('all_others')
    expect(result).toEqual({ status: 'unavailable', playbackEnabled: true, recordFormat: 'mpegts' })
  })

  it('reads the format off path defaults when the path has no runtime path or entry', async () => {
    api.pathsGet.mockResolvedValue(null)
    api.configPathGet.mockResolvedValue(null)
    api.configPathDefaultsGet.mockResolvedValue({ recordFormat: 'mpegts' })

    const result = await call(router.recordings.timeline, DAY)

    expect(result).toEqual({ status: 'unavailable', playbackEnabled: true, recordFormat: 'mpegts' })
  })

  // `url` names the api's view of MediaMTX (`mediamtx:9996`), useless to a
  // browser; the web builds its own from start and duration.
  it('maps the playback server\'s spans, dropping their url', async () => {
    fetchMock.mockResolvedValue(Response.json([
      { start: '2026-03-14T10:00:00Z', duration: 3600, url: 'http://mediamtx:9996/get?path=stream1' },
      { start: '2026-03-14T14:30:00Z', duration: 90.5, url: 'http://mediamtx:9996/get?path=stream1' },
    ]))

    const result = await call(router.recordings.timeline, DAY)

    expect(result).toEqual({
      status: 'available',
      spans: [
        { start: new Date('2026-03-14T10:00:00Z'), duration: 3600 },
        { start: new Date('2026-03-14T14:30:00Z'), duration: 90.5 },
      ],
    })
  })

  // Same host as the API, on the port `playbackAddress` names.
  it('asks the playback server for the path between the two instants', async () => {
    api.configGlobalGet.mockResolvedValue({ playback: true, playbackAddress: ':19996' })
    fetchMock.mockResolvedValue(Response.json([]))

    await call(router.recordings.timeline, DAY)

    expect(fetchMock.mock.lastCall?.[0]).toBe(
      'http://127.0.0.1:19996/list?path=stream1&start=2026-03-14T00%3A00%3A00.000Z&end=2026-03-15T00%3A00%3A00.000Z',
    )
  })

  // MediaMTX answers 404 for a range with no segments in it.
  it('is available with no spans when the playback server finds none', async () => {
    fetchMock.mockResolvedValue(Response.json({ error: 'no recordings found' }, { status: 404 }))

    const result = await call(router.recordings.timeline, DAY)

    expect(result).toEqual({ status: 'available', spans: [] })
  })

  it('passes the playback server\'s own reason through when it refuses', async () => {
    fetchMock.mockResolvedValue(Response.json({ error: 'authentication failed' }, { status: 401 }))

    await expect(call(router.recordings.timeline, DAY)).rejects.toThrow('authentication failed')
  })

  it('returns null when the MediaMTX API is unreachable', async () => {
    api.configGlobalGet.mockRejectedValue(new Error('fetch failed'))

    const result = await call(router.recordings.timeline, DAY)

    expect(result).toBeNull()
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

describe('sessions.list', () => {
  const NONE: MediaMtxSessionList = { pageCount: 0, items: [] }
  let lists: Partial<Record<SessionProtocol, MediaMtxSessionList | Error>>

  beforeEach(() => {
    lists = {}
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
    api.sessionsList.mockImplementation(async (protocol: SessionProtocol) => {
      const answer = lists[protocol] ?? NONE
      if (answer instanceof Error)
        throw answer
      return answer
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('merges every protocol into one list sorted by path, protocol, then created', async () => {
    lists = {
      rtsp: {
        pageCount: 1,
        items: [
          { id: 'r2', path: 'stream1', remoteAddr: '10.0.0.2:5000', state: 'read', created: '2026-10-01T10:05:00Z', inboundBytes: 10, outboundBytes: 20, bytesReceived: 999, bytesSent: 999 },
          { id: 'r1', path: 'stream1', remoteAddr: '10.0.0.1:5000', state: 'publish', created: '2026-10-01T10:00:00Z', inboundBytes: 100, outboundBytes: 0 },
        ],
      },
      srt: {
        pageCount: 1,
        items: [{ id: 's1', path: 'stream1', remoteAddr: '10.0.0.3:6000', state: 'read', created: '2026-10-01T09:00:00Z', bytesReceived: 5, bytesSent: 50 }],
      },
      hls: {
        pageCount: 1,
        items: [{ id: 'h1', path: 'cam', remoteAddr: '10.0.0.4', created: '2026-10-01T11:00:00Z', outboundBytes: 70 }],
      },
      webrtc: {
        pageCount: 1,
        items: [{ id: 'w1', path: 'stream1', remoteAddr: '10.0.0.5:7000', state: 'read', created: '2026-10-01T08:00:00Z', inboundBytes: 1, outboundBytes: 2 }],
      },
    }

    const state = await call(router.sessions.list, undefined as never)

    expect(state.status === 'connected' && state.sessions).toEqual([
      { id: 'h1', protocol: 'hls', path: 'cam', remoteAddr: '10.0.0.4', state: 'read', inboundBytes: null, outboundBytes: 70, created: new Date('2026-10-01T11:00:00Z') },
      { id: 'r1', protocol: 'rtsp', path: 'stream1', remoteAddr: '10.0.0.1:5000', state: 'publish', inboundBytes: 100, outboundBytes: 0, created: new Date('2026-10-01T10:00:00Z') },
      { id: 'r2', protocol: 'rtsp', path: 'stream1', remoteAddr: '10.0.0.2:5000', state: 'read', inboundBytes: 10, outboundBytes: 20, created: new Date('2026-10-01T10:05:00Z') },
      { id: 's1', protocol: 'srt', path: 'stream1', remoteAddr: '10.0.0.3:6000', state: 'read', inboundBytes: 5, outboundBytes: 50, created: new Date('2026-10-01T09:00:00Z') },
      { id: 'w1', protocol: 'webrtc', path: 'stream1', remoteAddr: '10.0.0.5:7000', state: 'read', inboundBytes: 1, outboundBytes: 2, created: new Date('2026-10-01T08:00:00Z') },
    ])
  })

  it('lists every protocol on the server', async () => {
    const state = await call(router.sessions.list, undefined as never)

    expect(api.sessionsList.mock.calls.map(([protocol]) => protocol))
      .toEqual(['rtsp', 'rtsps', 'rtmp', 'rtmps', 'srt', 'webrtc', 'hls'])
    expect(state.status === 'connected' && state.protocols.every(p => p.status === 'listed')).toBe(true)
  })

  // MediaMTX doesn't register a disabled protocol's routes at all.
  it('marks a protocol answering 404 as disabled and still lists the rest', async () => {
    lists = {
      rtmps: new MediaMtxError(404, null, 'GET /rtmpsconns/list'),
      rtsp: { pageCount: 1, items: [{ id: 'r1', path: 'stream1', remoteAddr: 'a', state: 'publish', created: '2026-10-01T10:00:00Z', inboundBytes: 1, outboundBytes: 0 }] },
    }

    const state = await call(router.sessions.list, undefined as never)

    expect(state.status === 'connected' && state.sessions.map(s => s.id)).toEqual(['r1'])
    expect(state.status === 'connected' && state.protocols.find(p => p.protocol === 'rtmps'))
      .toEqual({ protocol: 'rtmps', status: 'disabled', truncated: false })
  })

  it('marks a protocol failing any other way as failed', async () => {
    lists = { srt: new MediaMtxError(500, null, 'GET /srtconns/list') }

    const state = await call(router.sessions.list, undefined as never)

    expect(state.status === 'connected' && state.protocols.find(p => p.protocol === 'srt'))
      .toEqual({ protocol: 'srt', status: 'failed', truncated: false })
  })

  it('reports an unreachable MediaMTX when no list got an HTTP answer', async () => {
    api.sessionsList.mockRejectedValue(new TypeError('fetch failed'))

    const state = await call(router.sessions.list, undefined as never)

    expect(state).toEqual({
      status: 'connection-error',
      mediaMtxUrl: CONFIG.mediaMtxUrl,
      mediaMtxApiPort: CONFIG.mediaMtxApiPort,
    })
  })

  // A state a newer MediaMTX adds must not fail output validation for the
  // whole list.
  it('reads a state it doesn\'t know as idle', async () => {
    lists = {
      rtmp: { pageCount: 1, items: [{ id: 'm1', path: 'stream1', remoteAddr: 'a', state: 'handshaking', created: '2026-10-01T10:00:00Z', inboundBytes: 0, outboundBytes: 0 }] },
    }

    const state = await call(router.sessions.list, undefined as never)

    expect(state.status === 'connected' && state.sessions.map(s => s.state)).toEqual(['idle'])
  })

  it('reports the page size a truncated protocol was cut to', async () => {
    const state = await call(router.sessions.list, undefined as never)

    expect(state.status === 'connected' && state.pageSize).toBe(100)
  })

  it('flags a protocol with more than one page as truncated', async () => {
    lists = { webrtc: { pageCount: 3, items: [] } }

    const state = await call(router.sessions.list, undefined as never)

    expect(state.status === 'connected' && state.protocols.find(p => p.protocol === 'webrtc'))
      .toEqual({ protocol: 'webrtc', status: 'listed', truncated: true })
  })
})

describe('sessions.kick', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('kicks the session over its own protocol', async () => {
    api.sessionsKick.mockResolvedValue(undefined)

    await call(router.sessions.kick, { protocol: 'srt', id: 'abc' })

    expect(api.sessionsKick).toHaveBeenCalledWith('srt', 'abc')
  })

  it('answers NOT_FOUND when the session had already gone', async () => {
    api.sessionsKick.mockRejectedValue(new MediaMtxError(404, 'session not found', 'POST /srtconns/kick/abc'))

    await expect(call(router.sessions.kick, { protocol: 'srt', id: 'abc' }))
      .rejects
      .toMatchObject({ code: 'NOT_FOUND' })
  })

  it('answers INTERNAL_SERVER_ERROR on any other failure', async () => {
    api.sessionsKick.mockRejectedValue(new MediaMtxError(500, null, 'POST /srtconns/kick/abc'))

    await expect(call(router.sessions.kick, { protocol: 'srt', id: 'abc' }))
      .rejects
      .toMatchObject({ code: 'INTERNAL_SERVER_ERROR' })
  })
})

describe('mediamtx.info', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(mediaMtxApi).mockReturnValue(api as unknown as ReturnType<typeof mediaMtxApi>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // MediaMTX sends nanosecond precision; `new Date` keeps the milliseconds.
  const STARTED = '2026-10-01T14:17:37.190837375Z'

  it('reports the version verbatim, with the start time as a Date', async () => {
    api.info.mockResolvedValue({ version: 'v1.21.1', started: STARTED })

    const result = await call(router.mediamtx.info, undefined as never)

    expect(result).toEqual({
      version: 'v1.21.1',
      started: new Date('2026-10-01T14:17:37.190Z'),
      belowMinimum: false,
    })
  })

  it.each([
    { version: 'v1.20.0', belowMinimum: false },
    { version: 'v1.19.2', belowMinimum: true },
    { version: 'v0.23.0', belowMinimum: true },
    { version: 'v1.100.0', belowMinimum: false },
    // Anything after the patch number is ignored, so a release candidate of the
    // floor counts as the floor.
    { version: 'v1.20.0-rc1', belowMinimum: false },
    // Unparseable: shown as-is, never warned about.
    { version: 'dev', belowMinimum: false },
  ])('$version is belowMinimum: $belowMinimum', async ({ version, belowMinimum }) => {
    api.info.mockResolvedValue({ version, started: STARTED })

    const result = await call(router.mediamtx.info, undefined as never)

    expect(result).toMatchObject({ version, belowMinimum })
  })

  // `/v3/info` arrived in v1.15.2. An older server answers 404, which is a
  // reachable server with no version to show, not an unreachable one.
  it('reports no version when MediaMTX predates /v3/info', async () => {
    api.info.mockResolvedValue(null)

    const result = await call(router.mediamtx.info, undefined as never)

    expect(result).toEqual({ version: null, started: null, belowMinimum: false })
  })

  it('returns null when MediaMTX is unreachable', async () => {
    api.info.mockRejectedValue(new Error('fetch failed'))

    const result = await call(router.mediamtx.info, undefined as never)

    expect(result).toBeNull()
  })

  // Only a 404 means "no version"; any other refusal is a server we can't read.
  it('returns null and logs when /v3/info fails with anything but 404', async () => {
    api.info.mockRejectedValue(new MediaMtxError(500, null, 'GET /info'))

    const result = await call(router.mediamtx.info, undefined as never)

    expect(result).toBeNull()
    expect(logger.error).toHaveBeenCalledOnce()
  })
})

describe('recordings.listForStream', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'list-for-stream-'))
    mkdirSync(path.join(root, 'recordings', 'cam', 'front'), { recursive: true })
    writeFileSync(path.join(root, 'recordings', 'cam', 'front', '2026-07-01_10-00-00.mp4'), '')
    // Somewhere real to escape to, or the test passes on a missing directory.
    mkdirSync(path.join(root, 'sibling'))
    writeFileSync(path.join(root, 'sibling', 'secret.mp4'), '')
    vi.mocked(getAppConfig).mockResolvedValue({
      ...CONFIG,
      recordingsDirectory: path.join(root, 'recordings'),
      screenshotsDirectory: path.join(root, 'screenshots'),
    })
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('lists a nested MediaMTX path\'s recordings', async () => {
    const result = await call(router.recordings.listForStream, { streamName: 'cam/front', page: 1, take: 10 })

    expect(result.recordings.map(r => r.name)).toEqual(['2026-07-01_10-00-00.mp4'])
  })

  it('treats a name that climbs out of the recordings directory as no stream', async () => {
    const result = await call(router.recordings.listForStream, { streamName: '../sibling', page: 1, take: 10 })

    expect(result).toEqual({ recordings: [], totalCount: 0 })
  })
})
