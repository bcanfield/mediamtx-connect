import { expect, test } from '@playwright/test'

test.describe('Recordings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recordings')
  })

  test('should show cards, an empty state, or an error panel', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const bodyText = await page.locator('body').textContent()

    const hasCards = (await page.locator('[data-testid="stream-summary-card"]').count()) > 0
    const hasNoRecordingsMessage = bodyText?.includes('No recordings yet') ?? false
    const hasDirectoryError = bodyText?.includes('Can\'t read the recordings directory') ?? false

    expect(hasCards || hasNoRecordingsMessage || hasDirectoryError).toBe(true)
  })

  test('should show the totals summary and filter input when recordings exist', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const hasCards = (await page.locator('[data-testid="stream-summary-card"]').count()) > 0

    if (hasCards) {
      await expect(page.getByText(/\d+ streams? · \d+ recordings?/).first()).toBeVisible()
      await expect(page.getByRole('searchbox', { name: 'Filter streams' })).toBeVisible()
    }
  })

  test('pressing / focuses the filter input', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const filter = page.getByRole('searchbox', { name: 'Filter streams' })

    if (await filter.isVisible().catch(() => false)) {
      await page.keyboard.press('/')
      await expect(filter).toBeFocused()
    }
  })

  test('filters the grid client-side', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const filter = page.getByRole('searchbox', { name: 'Filter streams' })

    if (await filter.isVisible().catch(() => false)) {
      const allCount = await page.locator('[data-testid="stream-summary-card"]').count()
      await filter.fill('definitely-no-such-stream')
      await expect(page.locator('[data-testid="stream-summary-card"]')).toHaveCount(0)
      await expect(page.getByText('No matching streams')).toBeVisible()
      await filter.clear()
      await expect(page.locator('[data-testid="stream-summary-card"]')).toHaveCount(allCount)
    }
  })
})

test.describe('Recording Detail Page', () => {
  test('should handle non-existent stream gracefully', async ({ page }) => {
    await page.goto('/recordings/non-existent-stream')
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    const hasContent = bodyText && bodyText.length > 0
    expect(hasContent).toBe(true)
  })

  test('should navigate to detail page from recordings list', async ({ page }) => {
    await page.goto('/recordings')
    await page.waitForLoadState('networkidle')

    const card = page.locator('[data-testid="stream-summary-card"]').first()
    if (await card.isVisible().catch(() => false)) {
      await card.click()
      await expect(page).toHaveURL(/\/recordings\/.+/)
    }
  })

  test('should show recording rows grouped by day when recordings exist', async ({ page }) => {
    await page.goto('/recordings/stream1')
    await page.waitForLoadState('networkidle')

    const rows = page.locator('[data-testid="recording-row"]')
    if ((await rows.count()) > 0) {
      await expect(rows.first().getByRole('button', { name: 'Play', exact: true })).toBeVisible()
      // Day-group eyebrow headers render above the rows.
      await expect(page.locator('section h2').first()).toBeVisible()
    }
  })

  test('opens an inline player and tracks it in the URL', async ({ page }) => {
    await page.goto('/recordings/stream1')
    await page.waitForLoadState('networkidle')

    const row = page.locator('[data-testid="recording-row"]').first()
    if (await row.isVisible().catch(() => false)) {
      await row.getByRole('button', { name: 'Play', exact: true }).click()
      await expect(page).toHaveURL(/play=/)
      await expect(row.locator('video')).toBeVisible()
      await row.getByRole('button', { name: 'Close' }).click()
      await expect(page).not.toHaveURL(/play=/)
    }
  })
})

test.describe('Recordings Navigation', () => {
  test('should navigate back to recordings list from detail breadcrumb', async ({ page }) => {
    await page.goto('/recordings/stream1')
    await page.waitForLoadState('networkidle')

    const backLink = page.getByRole('link', { name: 'Recordings', exact: true }).last()
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click()
      await expect(page).toHaveURL(/\/recordings$/)
    }
  })

  test('should show the breadcrumb on the detail page', async ({ page }) => {
    await page.goto('/recordings/stream1')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible()
  })
})
