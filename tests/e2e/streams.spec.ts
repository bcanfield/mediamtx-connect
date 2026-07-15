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
})
