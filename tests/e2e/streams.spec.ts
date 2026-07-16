import { expect, test } from '@playwright/test'
import { getNavItem } from './open-mobile-nav'

test.describe('Live View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the top nav with the Live tab active', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await expect(getNavItem(page, 'Live')).toHaveAttribute('aria-current', 'page')
  })

  test('should have working navigation to App Config', async ({ page }) => {
    await getNavItem(page, 'App Config').click({ force: true })
    await expect(page).toHaveURL(/\/config/)
  })

  test('should have working navigation to recordings page', async ({ page }) => {
    await getNavItem(page, 'Recordings').click({ force: true })
    await expect(page).toHaveURL(/\/recordings/)
  })
})

test.describe('Live View - With MediaMTX Running', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show one of the designed page states', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const bodyText = await page.locator('body').textContent()
    const hasConnectionError = bodyText?.includes('Can\'t reach MediaMTX') ?? false
    const hasStreams = (await page.locator('[data-testid="stream-card"]').count()) > 0
    const hasNoStreams = bodyText?.includes('No streams are publishing') ?? false
    const hasPlaybackBanner = bodyText?.includes('Playback URL not set') ?? false

    expect(hasConnectionError || hasStreams || hasNoStreams || hasPlaybackBanner).toBe(true)
  })

  test('should show the toolbar summary when streams exist', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const cardCount = await page.locator('[data-testid="stream-card"]').count()

    if (cardCount > 0) {
      await expect(page.getByText(/\d+ streams? · \d+ playing/).first()).toBeVisible()
    }
  })

  test('should display stream names when streams exist', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const cardCount = await page.locator('[data-testid="stream-card"]').count()

    if (cardCount > 0) {
      const bodyText = await page.locator('body').textContent()
      const hasStreamNames
        = bodyText?.includes('stream1')
          || bodyText?.includes('stream2')
          || bodyText?.includes('stream3')
          || bodyText?.includes('stream4')
          || bodyText?.includes('stream5')
      expect(hasStreamNames).toBe(true)
    }
  })

  test('stream cards expose playback and an actions menu', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const card = page.locator('[data-testid="stream-card"]').first()

    if (await card.isVisible().catch(() => false)) {
      await expect(card.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
      await card.getByRole('button', { name: 'Stream actions' }).click()
      await expect(page.getByRole('menuitem', { name: 'View recordings' })).toBeVisible()
    }
  })

  test('card actions deep-link to the stream\'s own path config', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const card = page.locator('[data-testid="stream-card"]').first()

    if (await card.isVisible().catch(() => false)) {
      // The card's first paragraph is its stream name.
      const streamName = await card.locator('p').first().textContent() ?? ''
      await card.getByRole('button', { name: 'Stream actions' }).click()
      // Navigates rather than toasting "Not implemented yet" — this action is
      // no longer a stub. Read-only: opening the page materializes nothing.
      await page.getByRole('menuitem', { name: 'Edit path config' }).click()
      await expect(page).toHaveURL(`/config/mediamtx/paths/${encodeURIComponent(streamName)}`)
      await expect(page.getByRole('heading', { name: `Path Config · ${streamName}` })).toBeVisible()
    }
  })

  test('card actions deep-link to the stream\'s hooks', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const card = page.locator('[data-testid="stream-card"]').first()

    if (await card.isVisible().catch(() => false)) {
      const streamName = await card.locator('p').first().textContent() ?? ''
      await card.getByRole('button', { name: 'Stream actions' }).click()
      // No longer a stub: the same path-config route as "Edit path config",
      // landed on the hooks section rather than a surface of its own.
      await page.getByRole('menuitem', { name: 'Edit hooks' }).click()
      await expect(page).toHaveURL(
        `/config/mediamtx/paths/${encodeURIComponent(streamName)}?section=pathHooks`,
      )
      await expect(page.getByRole('heading', { name: 'Path Hooks' })).toBeInViewport()
    }
  })
})
