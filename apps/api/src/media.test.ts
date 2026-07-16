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
