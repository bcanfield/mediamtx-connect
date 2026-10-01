// E2E because it needs a live MediaMTX write and MediaMTX's real playback
// server: the guided card turns playback on, and only a running recorder
// produces the spans /list indexes and the fMP4 /get stitches.
import type { APIRequestContext } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'
const PLAYBACK = 'http://localhost:9996'

// Wildcard-backed, publishing and recording, and no other spec writes it.
// stream2 was the first pick, but record-toggle.spec.ts turns its recording
// off for a while, and a stopped recorder writes no segment to wait for.
const STREAM = 'stream4'

type Scope = 'global' | 'pathdefaults'

// MediaMTX restarts its API listener on some global writes (publish-urls.spec.ts
// moves rtmpAddress), so a pooled socket can be dead on arrival. Retrying gets
// a fresh one. Both writes are idempotent.
async function patch(request: APIRequestContext, scope: Scope, data: Record<string, unknown>) {
  await expect.poll(async () => {
    try {
      return (await request.patch(`${API}/config/${scope}/patch`, { data })).ok()
    }
    catch {
      return false
    }
  }).toBe(true)
}

async function read(request: APIRequestContext, scope: Scope): Promise<Record<string, unknown>> {
  let body: Record<string, unknown> = {}
  await expect.poll(async () => {
    try {
      const res = await request.get(`${API}/config/${scope}/get`)
      if (!res.ok())
        return false
      body = await res.json()
      return true
    }
    catch {
      return false
    }
  }).toBe(true)
  return body
}

// What the playback server indexes for STREAM from `since` on. 404 is its
// answer for "no segment yet"; a socket error is the server mid-restart.
async function spansSince(request: APIRequestContext, since: Date): Promise<number> {
  try {
    const res = await request.get(`${PLAYBACK}/list`, { params: { path: STREAM, start: since.toISOString() } })
    return res.ok() ? (await res.json()).length : 0
  }
  catch {
    return 0
  }
}

// Writes server-wide state: path defaults' recordPath (every recorder on the
// server restarts on it) and global `playback` (only the playback server
// restarts; MediaMTX's closeAPI doesn't depend on it, so no other spec's API
// calls or listeners notice). The card has to write both, so this can't be
// confined to one path; it restores both instead. A second copy of this test
// would undo the first one's writes mid-test, so playwright.config runs this
// file in its own one-worker project.
test.describe('Recording timeline', () => {
  test('enables recording playback from the card and plays a span through the api', async ({ page, request }) => {
    // Generous on purpose: under a full parallel run, page loads alone can
    // take seconds. The waits below are what actually bound it.
    test.setTimeout(90_000)

    const global = await read(request, 'global')
    const defaults = await read(request, 'pathdefaults')
    await patch(request, 'global', { playback: false })
    try {
      await page.goto(`/recordings/${STREAM}`)
      await expect(page.getByRole('heading', { name: 'Turn on recording playback' })).toBeVisible()

      // From here on, so a span left on disk by an earlier run can't pass this.
      const applied = new Date()
      await page.getByRole('button', { name: 'Apply changes' }).click()

      // The server-side signal, without reloading the page to look for it. The
      // playback server only answers once `playback` is on, and the recordPath
      // write restarts the recorder, which opens a new segment on the next
      // keyframe (stream4's GOP is 2s) and puts it on disk when its first 1s
      // part closes. /list sees it from then on: seconds, not minutes.
      await expect.poll(() => spansSince(request, applied), { timeout: 30_000 }).toBeGreaterThan(0)

      // path-config.spec.ts flips path defaults' recordFormat for a moment,
      // which brings the card back, so reload through it rather than once.
      // Each try gets a full page load's worth of time.
      const spans = page.getByRole('list', { name: 'Recorded spans' }).getByRole('button')
      await expect(async () => {
        await page.reload()
        await expect(spans.first()).toBeVisible({ timeout: 10_000 })
      }).toPass({ timeout: 30_000 })

      await spans.first().click()
      const src = await page.locator('video').getAttribute('src')
      expect(src).toMatch(new RegExp(`^/media/playback/get\\?path=${STREAM}&start=.+&duration=`))

      // Not currentTime: Playwright's Chromium may lack H.264. The bytes are
      // what Connect is on the hook for.
      const res = await request.get(src!)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toBe('video/mp4')
      expect((await res.body()).subarray(4, 8).toString('ascii')).toBe('ftyp')

      // The same span as a plain MP4 clip, saved through the browser. "Last 5
      // min" is clamped to the span's start, and the span may be seconds old,
      // so this asserts a real file, not a duration (the unit tests cover the
      // range maths).
      const clip = page.getByRole('region', { name: 'Download clip' })
      await clip.getByRole('button', { name: 'Last 5 min' }).click()
      const clipResponse = page.waitForResponse(r => r.url().includes('/media/playback/get?') && r.url().includes('format=mp4'))
      const download = page.waitForEvent('download')
      await clip.getByRole('button', { name: 'Download' }).click()
      expect((await clipResponse).status()).toBe(200)
      expect((await clipResponse).headers()['content-type']).toBe('video/mp4')
      const saved = await download
      expect(saved.suggestedFilename()).toMatch(new RegExp(`^${STREAM}_\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}\\.mp4$`))
      const bytes = await readFile((await saved.path())!)
      expect(bytes.subarray(4, 8).toString('ascii')).toBe('ftyp')
      // More than ftyp + moov alone (well under 2 kB): stream4's HEVC keyframe
      // at 540p is several kB by itself.
      expect(bytes.length).toBeGreaterThan(2_000)

      // The <video> may still be streaming that span through the api, and the
      // restore below closes the playback server under it.
      await page.goto('about:blank')
    }
    finally {
      // Playback first: MediaMTX refuses a recordPath without %f while it's on.
      // recordFormat is left alone: the card only writes it when it isn't fmp4,
      // and the only other spec that writes it (path-config) restores its own.
      // Restoring a snapshot taken mid-flip would pin it to mpegts for the run.
      await patch(request, 'global', { playback: global.playback ?? false })
      await patch(request, 'pathdefaults', { recordPath: defaults.recordPath })
    }
  })
})
