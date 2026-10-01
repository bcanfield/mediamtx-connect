// E2E because it needs a live MediaMTX write and MediaMTX's real playback
// server: the guided card turns playback on, and only a running recorder
// produces the spans /list indexes and the fMP4 /get stitches.
import type { APIRequestContext } from '@playwright/test'
import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// Wildcard-backed, publishing and recording. record-toggle.spec.ts also uses
// stream2, but only ever writes `record`, which this spec never reads.
const STREAM = 'stream2'

type Scope = 'global' | 'pathdefaults'

// MediaMTX restarts its API listener on a global write and every path's
// recorder on a recordPath write, and other specs write in parallel, so a
// pooled socket can be dead on arrival. Retrying gets a fresh one, as in
// publish-urls.spec.ts. Both writes are idempotent.
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

test.describe('Recording timeline', () => {
  test('enables recording playback from the card and plays a span through the api', async ({ page, request }) => {
    // A recorder restart plus a first segment on disk, on top of the page work.
    test.setTimeout(120_000)

    const global = await read(request, 'global')
    const defaults = await read(request, 'pathdefaults')
    await patch(request, 'global', { playback: false })
    try {
      await page.goto(`/recordings/${STREAM}`)
      await expect(page.getByRole('heading', { name: 'Turn on recording playback' })).toBeVisible()
      await page.getByRole('button', { name: 'Apply changes' }).click()

      // The recorder restarts on the recordPath change, and /list only sees
      // segments named with the new %f. path-config.spec.ts can also flip
      // recordFormat for a moment, which brings the card back; reload through it.
      const spans = page.getByRole('list', { name: 'Recorded spans' }).getByRole('button')
      await expect(async () => {
        await page.reload()
        await expect(spans.first()).toBeVisible({ timeout: 2_000 })
      }).toPass({ timeout: 90_000 })

      await spans.first().click()
      const src = await page.locator('video').getAttribute('src')
      expect(src).toMatch(new RegExp(`^/media/playback/get\\?path=${STREAM}&start=.+&duration=`))

      // Not currentTime: Playwright's Chromium may lack H.264, so in-browser
      // playback is a manual check. The bytes are what Connect is on the hook for.
      const res = await request.get(src!)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toBe('video/mp4')
      expect((await res.body()).subarray(4, 8).toString('ascii')).toBe('ftyp')
    }
    finally {
      // Playback first: MediaMTX refuses a recordPath without %f while it's on.
      await patch(request, 'global', { playback: global.playback ?? false })
      await patch(request, 'pathdefaults', {
        recordFormat: defaults.recordFormat,
        recordPath: defaults.recordPath,
      })
    }
  })
})
