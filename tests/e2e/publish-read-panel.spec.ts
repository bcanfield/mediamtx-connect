import { expect, test } from '@playwright/test'

// A ready fixture stream. Read-only: nothing here writes config, so it can run
// alongside the specs that do.
const STREAM = 'stream3'

test.describe('Publish & read panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/config/mediamtx/paths/${STREAM}`)
  })

  // CI's remoteMediaMtxUrl is http://localhost and its mediaMtxUrl is
  // http://127.0.0.1, so `localhost` here proves the browser-facing host wins.
  test('publishes to the browser-facing host', async ({ page }) => {
    const panel = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Publish & read' }) })
    await expect(panel.getByText(`rtsp://localhost:8554/${STREAM}`, { exact: true })).toBeVisible()
    await expect(panel.getByText(/127\.0\.0\.1/)).toHaveCount(0)
  })

  test('reads HLS from a URL MediaMTX actually serves', async ({ page, request }) => {
    await page.getByRole('tab', { name: 'Read' }).click()
    const hls = page.locator('section').filter({ has: page.getByRole('heading', { name: 'HLS', exact: true }) })
    const url = await hls.locator('code').textContent()
    expect(url).toBe(`http://localhost:8888/${STREAM}/index.m3u8`)

    // The muxer starts on the first request, so the first answers can be slow
    // or a brief 404.
    await expect.poll(async () => {
      try {
        const response = await request.get(url!)
        return response.ok() ? (await response.text()).slice(0, 7) : response.status()
      }
      catch {
        return 'unreachable'
      }
    }, { timeout: 30_000 }).toBe('#EXTM3U')
  })
})
