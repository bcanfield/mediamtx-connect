import { statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { media } from './media'

// Unlike media.test.ts, this suite uses the real filesystem against the
// committed fixtures — Range/206 is byte arithmetic over a real file size, and
// mocking statSync would only assert our own mock. These replace the
// api.spec.ts tests that hit the same routes through a browser and a live
// server, where every assertion was wrapped in `if (status === 200)` and the
// stream name (`camera1`) did not exist, so the 206 branch never once ran.
vi.mock('./config-store', () => ({ getAppConfig: vi.fn() }))
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const fixtures = path.join(
  fileURLToPath(new URL('../../../', import.meta.url)),
  'tests/fixtures',
)

const CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: path.join(fixtures, 'recordings'),
  screenshotsDirectory: path.join(fixtures, 'screenshots'),
}

const RECORDING = '2024-01-15_10-30-00.mp4'
const SIZE = statSync(path.join(CONFIG.recordingsDirectory, 'stream1', RECORDING)).size

beforeEach(() => {
  vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
})

describe('recording playback', () => {
  it('serves the whole file with the headers a <video> needs to seek', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('video/mp4')
    // Without this the browser downloads rather than scrubs.
    expect(res.headers.get('accept-ranges')).toBe('bytes')
    expect(res.headers.get('content-length')).toBe(String(SIZE))
  })

  it('serves a closed byte range as 206 with exactly those bytes', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}`, {
      headers: { Range: 'bytes=0-99' },
    })

    expect(res.status).toBe(206)
    expect(res.headers.get('content-range')).toBe(`bytes 0-99/${SIZE}`)
    expect(res.headers.get('content-length')).toBe('100')
    expect((await res.arrayBuffer()).byteLength).toBe(100)
  })

  it('reads an open-ended range to the last byte', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}`, {
      headers: { Range: 'bytes=100-' },
    })

    expect(res.status).toBe(206)
    expect(res.headers.get('content-range')).toBe(`bytes 100-${SIZE - 1}/${SIZE}`)
    expect((await res.arrayBuffer()).byteLength).toBe(SIZE - 100)
  })

  it('reads a suffix range from the end of the file', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}`, {
      headers: { Range: 'bytes=-100' },
    })

    expect(res.status).toBe(206)
    expect(res.headers.get('content-range')).toBe(`bytes ${SIZE - 100}-${SIZE - 1}/${SIZE}`)
    expect((await res.arrayBuffer()).byteLength).toBe(100)
  })

  it('rejects a range that starts past the end with 416', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}`, {
      headers: { Range: `bytes=${SIZE + 1}-` },
    })

    expect(res.status).toBe(416)
    expect(res.headers.get('content-range')).toBe(`bytes */${SIZE}`)
  })

  it('404s an unknown recording', async () => {
    const res = await media.request('/recordings/stream1/nope.mp4')

    expect(res.status).toBe(404)
  })

  it('404s an unknown stream', async () => {
    const res = await media.request(`/recordings/no-such-stream/${RECORDING}`)

    expect(res.status).toBe(404)
  })
})

describe('recording download', () => {
  it('marks a ?download request as an attachment', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}?download`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-disposition')).toBe(`attachment; filename="${RECORDING}"`)
    expect(res.headers.get('content-type')).toBe('video/mp4')
  })

  it('serves inline without the download flag', async () => {
    const res = await media.request(`/recordings/stream1/${RECORDING}`)

    expect(res.headers.get('content-disposition')).toBeNull()
  })
})

describe('screenshots', () => {
  it('serves the latest screenshot as an uncached PNG', async () => {
    const res = await media.request('/screenshots/stream1/latest')

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    // Snapshots are overwritten in place, so a cached one goes stale silently.
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  it('404s a stream with no screenshots', async () => {
    const res = await media.request('/screenshots/no-such-stream/latest')

    expect(res.status).toBe(404)
  })
})

// These must escape to a file that actually EXISTS, or they pass on
// existsSync returning false and stay green with the guard deleted — the
// "green for the wrong reason" traversal test docs/TESTING.md warns about,
// which has already shipped here once. Both were verified to return 200 with
// safeJoin's startsWith check removed.
describe('path traversal', () => {
  it('refuses to serve a real file outside the recordings directory', async () => {
    // Resolves to <fixtures>/screenshots/stream1/<png>, which is on disk.
    const res = await media.request(
      '/recordings/..%2Fscreenshots/stream1%2F2024-01-15_10-30-00.png',
    )

    expect(res.status).toBe(404)
  })

  it('refuses to serve a real file outside the screenshots directory', async () => {
    // Scoped to one stream's folder so a sibling stream is somewhere to escape to.
    vi.mocked(getAppConfig).mockResolvedValue({
      ...CONFIG,
      screenshotsDirectory: path.join(fixtures, 'screenshots', 'stream1'),
    })

    const res = await media.request('/screenshots/..%2Fstream2/2024-01-15_12-00-00.png')

    expect(res.status).toBe(404)
  })
})
