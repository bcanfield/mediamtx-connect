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

  test('cards show the codecs the stream is publishing', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const card = page.locator('[data-testid="stream-card"]').first()

    // Codec chips come from the path list's tracks, which only a ready stream
    // has. "online since" on the footer is that same readiness, so a card
    // showing it has to show its codecs too.
    if (await card.getByText(/^online since/).count() > 0)
      await expect(card).toContainText(/H264|H265|AV1|VP9|MPEG-4 Audio|Opus/)
  })

  test('cards show how many people are watching', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const card = page.locator('[data-testid="stream-card"]').first()

    if (await card.count() > 0) {
      // Nobody watching is the normal resting state and reads "0 viewers" — the
      // count is always known, so the zone always renders.
      await expect(card.getByText(/^\d+ viewers?$/)).toBeVisible()
    }
  })

  test('an idle card says how old its snapshot is', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const card = page.locator('[data-testid="stream-card"]').first()
    const pill = card.locator('span').filter({ hasText: /^SNAPSHOT/ }).first()

    // The pill renders only when the thumbnail loaded, which means our capture
    // job has written a PNG — so whenever it's on screen its age is known and
    // has to be shown. A bare "SNAPSHOT" here is the bug. The age is
    // relativeTime output ("now", "2 minutes ago"), so match it loosely.
    if (await pill.count() > 0)
      await expect(pill).toHaveText(/^SNAPSHOT · \S/)
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
