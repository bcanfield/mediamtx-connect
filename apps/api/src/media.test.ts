import { createReadStream, existsSync, readdirSync } from 'node:fs'
import { Readable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { media } from './media'

// Factories (not automock) so the real modules never load — config-store pulls in
// env.ts, which validates process.env at import time.
vi.mock('./config-store', () => ({ getAppConfig: vi.fn() }))
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
// Keep the rest of node:fs real; only the calls media.ts makes are faked.
vi.mock('node:fs', async importActual => ({
  ...await importActual<typeof import('node:fs')>(),
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  createReadStream: vi.fn(),
}))

const CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/rec',
  screenshotsDirectory: '/shots',
}

/** Make existsSync true for exactly these paths. */
function existsOnly(...paths: string[]) {
  vi.mocked(existsSync).mockImplementation(p => paths.includes(String(p)))
}

/** The path streamResponse opened, or undefined if it never streamed. */
function servedPath(): string | undefined {
  return vi.mocked(createReadStream).mock.calls[0]?.[0] as string | undefined
}

describe('latest screenshot route', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.mocked(createReadStream).mockReturnValue(
      Readable.from(['png-bytes']) as unknown as ReturnType<typeof createReadStream>,
    )
    vi.mocked(readdirSync).mockReturnValue([])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('serves the live snapshot when the stream is running', async () => {
    existsOnly('/shots/stream1', '/shots/stream1/live.png')

    const res = await media.request('/screenshots/stream1/latest')

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(servedPath()).toBe('/shots/stream1/live.png')
  })

  it('never reads the directory when a live snapshot exists', async () => {
    existsOnly('/shots/stream1', '/shots/stream1/live.png')

    await media.request('/screenshots/stream1/latest')

    expect(readdirSync).not.toHaveBeenCalled()
  })

  it('falls back to the newest recording thumbnail once the stream goes offline', async () => {
    existsOnly('/shots/stream1')
    // Deliberately not in order: readdir order is not guaranteed, and these
    // names only sort chronologically because of the %Y-%m-%d_%H-%M-%S format.
    vi.mocked(readdirSync).mockReturnValue([
      '2026-07-15_10-00-00.png',
      '2026-07-16_09-00-00.png',
      '2026-07-14_23-00-00.png',
    ] as never)

    const res = await media.request('/screenshots/stream1/latest')

    expect(res.status).toBe(200)
    expect(servedPath()).toBe('/shots/stream1/2026-07-16_09-00-00.png')
  })

  it('ignores non-png files when falling back', async () => {
    existsOnly('/shots/stream1')
    vi.mocked(readdirSync).mockReturnValue([
      '2026-07-16_09-00-00.png',
      'zzz-not-an-image.txt',
    ] as never)

    await media.request('/screenshots/stream1/latest')

    expect(servedPath()).toBe('/shots/stream1/2026-07-16_09-00-00.png')
  })

  it('404s when the stream has no screenshots directory', async () => {
    existsOnly()

    const res = await media.request('/screenshots/never-seen/latest')

    expect(res.status).toBe(404)
    expect(createReadStream).not.toHaveBeenCalled()
  })

  it('404s when the directory holds no pngs', async () => {
    existsOnly('/shots/stream1')
    vi.mocked(readdirSync).mockReturnValue(['notes.txt'] as never)

    const res = await media.request('/screenshots/stream1/latest')

    expect(res.status).toBe(404)
    expect(createReadStream).not.toHaveBeenCalled()
  })

  it('rejects a stream name that escapes the screenshots directory', async () => {
    // Both the escaped dir and a live.png inside it exist, so only safeJoin's
    // rejection can stop this from being served.
    existsOnly('/etc', '/etc/live.png')

    const res = await media.request(`/screenshots/${encodeURIComponent('../../etc')}/latest`)

    expect(res.status).toBe(404)
    expect(createReadStream).not.toHaveBeenCalled()
  })

  it('marks every response no-store so a stale snapshot is never cached', async () => {
    existsOnly('/shots/stream1', '/shots/stream1/live.png')
    const hit = await media.request('/screenshots/stream1/latest')
    expect(hit.headers.get('cache-control')).toBe('no-store')

    existsOnly()
    const miss = await media.request('/screenshots/stream1/latest')
    expect(miss.headers.get('cache-control')).toBe('no-store')
  })
})

describe('recording playback proxy', () => {
  // Two upstreams: the v3 API for `playbackAddress`, then the playback server.
  const fetchMock = vi.fn<typeof fetch>()

  function upstream(playback: () => Response | Promise<Response>) {
    fetchMock.mockImplementation(async (url) => {
      if (String(url).includes(':9997/v3/config/global/get'))
        return Response.json({ playback: true, playbackAddress: ':9996' })
      return playback()
    })
  }

  /** The URL the proxy asked the playback server for. */
  function playbackRequest(): string | undefined {
    return fetchMock.mock.calls.map(([url]) => String(url)).find(url => url.includes(':9996/'))
  }

  const VALID = '/playback/get?path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=60'

  beforeEach(() => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    vi.stubGlobal('fetch', fetchMock)
    upstream(() => new Response('fmp4-bytes', { status: 200 }))
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })

  it('streams the playback server\'s fMP4 back as video/mp4', async () => {
    const res = await media.request(VALID)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('video/mp4')
    expect(await res.text()).toBe('fmp4-bytes')
  })

  it('asks for fMP4 with the path, start and duration encoded', async () => {
    await media.request('/playback/get?path=cam%2Fone%20two&start=2026-03-14T10%3A00%3A00%2B01%3A00&duration=90.5')

    expect(playbackRequest()).toBe(
      'http://127.0.0.1:9996/get?path=cam%2Fone+two&start=2026-03-14T10%3A00%3A00%2B01%3A00&duration=90.5&format=fmp4',
    )
  })

  // A span can be hours long; only #349's mp4 downloads get a cap.
  it('forwards a two-hour duration uncapped', async () => {
    await media.request('/playback/get?path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=7200')

    expect(new URL(playbackRequest()!).searchParams.get('duration')).toBe('7200')
  })

  it('asks for plain MP4 when the clip download wants it', async () => {
    await media.request(`${VALID}&format=mp4`)

    expect(new URL(playbackRequest()!).searchParams.get('format')).toBe('mp4')
  })

  it('accepts exactly one hour of MP4', async () => {
    const res = await media.request('/playback/get?path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=3600&format=mp4')

    expect(res.status).toBe(200)
  })

  it.each([
    { name: 'no path', query: 'start=2026-03-14T10%3A00%3A00Z&duration=60' },
    { name: 'no start', query: 'path=stream1&duration=60' },
    { name: 'a start that is not RFC 3339', query: 'path=stream1&start=yesterday&duration=60' },
    { name: 'a start that is no real time', query: 'path=stream1&start=2026-13-45T10%3A00%3A00Z&duration=60' },
    { name: 'a start with no offset', query: 'path=stream1&start=2026-03-14T10%3A00%3A00&duration=60' },
    { name: 'no duration', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z' },
    { name: 'a duration that is not a number', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=abc' },
    { name: 'a zero duration', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=0' },
    { name: 'an infinite duration', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=Infinity' },
    { name: 'a duration that overflows to infinity', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=1e999' },
    { name: 'a format MediaMTX cannot mux', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=60&format=avi' },
    { name: 'an MP4 longer than an hour', query: 'path=stream1&start=2026-03-14T10%3A00%3A00Z&duration=3601&format=mp4' },
  ])('answers 400 for $name without asking MediaMTX', async ({ query }) => {
    const res = await media.request(`/playback/get?${query}`)

    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('answers 404 when the playback server has nothing in that range', async () => {
    upstream(() => Response.json({ error: 'no recordings found' }, { status: 404 }))

    const res = await media.request(VALID)

    expect(res.status).toBe(404)
  })

  it('answers 502 when the playback server refuses the connection', async () => {
    upstream(() => Promise.reject(new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } })))

    const res = await media.request(VALID)

    expect(res.status).toBe(502)
  })
})
