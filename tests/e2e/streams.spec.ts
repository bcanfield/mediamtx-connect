import { expect, test } from '@playwright/test'
import { getNavItem } from './open-mobile-nav'

// Card *contents* — codecs, viewer counts, the snapshot pill, the actions menu
// and its mutations — moved to apps/web/src/features/streams/stream-card*.test.tsx,
// where the props are the fixture and the assertions can't be skipped. What's
// left here is what only a real browser against a real MediaMTX can show:
// navigation between pages, and a snapshot capture that actually runs ffmpeg.
//
// Nothing below is guarded. scripts/wait-for-mediamtx.mjs gates the suite on
// stream1..5 + front-door being published AND ready, so "no cards" is a
// failure, not a state to tolerate.

test.describe('Live View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads the top nav with the Live tab active', async ({ page }) => {
    await expect(getNavItem(page, 'Live')).toHaveAttribute('aria-current', 'page')
  })

  test('navigates to App Config', async ({ page }) => {
    await getNavItem(page, 'App Config').click({ force: true })
    await expect(page).toHaveURL(/\/config/)
  })

  test('navigates to recordings', async ({ page }) => {
    await getNavItem(page, 'Recordings').click({ force: true })
    await expect(page).toHaveURL(/\/recordings/)
  })
})

test.describe('Live View - With MediaMTX Running', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders a card for the fixture streams', async ({ page }) => {
    const cards = page.locator('[data-testid="stream-card"]')

    await expect(cards.first()).toBeVisible()
    for (const name of ['stream1', 'stream2', 'front-door'])
      await expect(cards.filter({ hasText: name })).toHaveCount(1)
  })

  test('summarises the fleet in the toolbar', async ({ page }) => {
    await expect(page.getByText(/\d+ streams? · \d+ playing/).first()).toBeVisible()
  })

  test('card actions deep-link to the stream\'s own path config', async ({ page }) => {
    const card = page.locator('[data-testid="stream-card"]').filter({ hasText: 'stream1' })

    await card.getByRole('button', { name: 'Stream actions' }).click()
    // Read-only: opening the page materializes nothing.
    await page.getByRole('menuitem', { name: 'Edit path config' }).click()

    await expect(page).toHaveURL('/config/mediamtx/paths/stream1')
    await expect(page.getByRole('heading', { name: 'Path Config · stream1' })).toBeVisible()
  })

  test('card actions deep-link to the stream\'s hooks', async ({ page }) => {
    const card = page.locator('[data-testid="stream-card"]').filter({ hasText: 'stream1' })

    await card.getByRole('button', { name: 'Stream actions' }).click()
    await page.getByRole('menuitem', { name: 'Edit hooks' }).click()

    await expect(page).toHaveURL('/config/mediamtx/paths/stream1?section=pathHooks')
    await expect(page.getByRole('heading', { name: 'Path Hooks' })).toBeInViewport()
  })

  // The component suite covers the mutation and its toast against a stub. This
  // one is here because it spawns a real ffmpeg against a real RTSP feed —
  // the half no mock can tell us works.
  test('taking a snapshot on demand captures a real frame', async ({ page }) => {
    const card = page.locator('[data-testid="stream-card"]').filter({ hasText: 'stream1' })

    await card.getByRole('button', { name: 'Stream actions' }).click()
    await page.getByRole('menuitem', { name: 'Take snapshot' }).click()

    await expect(page.getByText('Snapshot captured')).toBeVisible({ timeout: 20_000 })
  })
})
