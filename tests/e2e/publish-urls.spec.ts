import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// Any ready stream — copying a card's publish URLs reads nothing from the
// stream itself, only the server's listen addresses, so the choice is free.
const STREAM = 'stream3'

// A deliberately non-default RTMP port. Asserting against MediaMTX's default
// (1935) would pass even with the old hardcoded-port bug present; a changed
// listen address is the only thing that proves the URL is built from config.
const RTMP_PORT = 11935

test.describe('Copy publish URLs', () => {
  // Patches the server-wide RTMP listen address, a singleton. Restricting to
  // one browser (this spec isn't in playwright.config's uiSpecs matrix) keeps
  // the five UI projects from racing that one key. RTMP has no publisher in the
  // fixtures, so moving its port leaves the RTSP streams untouched.
  test('copies a URL built from the configured RTMP port', async ({ page, context, request }) => {
    const before = await (await request.get(`${API}/config/global/get`)).json()

    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await request.patch(`${API}/config/global/patch`, { data: { rtmpAddress: `:${RTMP_PORT}` } })
    try {
      await page.goto('/')
      const card = page.locator('[data-testid="stream-card"]').filter({ hasText: STREAM })
      await expect(card).toBeVisible()

      await card.getByRole('button', { name: 'Stream actions' }).click()
      await page.getByRole('menuitem', { name: 'Copy publish URLs' }).click()

      // No longer a stub: a success toast rather than "Not implemented yet".
      await expect(page.getByText('Publish URLs copied')).toBeVisible()
      await expect(page.getByText('Not implemented yet')).toBeHidden()

      const clipboard = await page.evaluate(() => navigator.clipboard.readText())
      // The RTMP URL carries the port the operator configured, not the default.
      expect(clipboard).toMatch(new RegExp(`^rtmp://.+:${RTMP_PORT}/${STREAM}$`, 'm'))
      expect(clipboard).not.toContain(':1935/')
    }
    finally {
      await request.patch(`${API}/config/global/patch`, {
        data: { rtmpAddress: before.rtmpAddress ?? ':1935' },
      })
    }
  })
})
