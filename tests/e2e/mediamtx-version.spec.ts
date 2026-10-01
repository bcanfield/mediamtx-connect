import { expect, test } from '@playwright/test'

// Read-only. What the component suite can't show: that the header's version is
// the one the real MediaMTX serves, through the real /v3/info and our handler.

test('the header shows the version MediaMTX reports', async ({ page, request }) => {
  // Polled, not read once: other specs' config writes restart MediaMTX's API
  // listener (see publish-urls.spec.ts), so a single read can hit it mid-restart.
  let version = ''
  await expect.poll(async () => {
    try {
      const res = await request.get('http://localhost:9997/v3/info')
      version = res.ok() ? (await res.json() as { version?: string }).version ?? '' : ''
    }
    catch {
      version = ''
    }
    return version
  }).not.toBe('')

  await page.goto('/')

  await expect(page.getByRole('banner')).toContainText(`connected · ${version}`)
})
