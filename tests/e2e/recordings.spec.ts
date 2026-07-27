import { expect, test } from '@playwright/test'

// Unguarded on purpose. globalSetup seeds tests/fixtures/recordings into the
// e2e data dir before the server boots, so stream1..3 always have recordings —
// the `if (hasCards)` wrappers these tests used to carry were tolerating a
// state the fixtures rule out, and passing whenever the page rendered nothing.

test.describe('Recordings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recordings')
  })

  test('lists a card per stream that has recordings', async ({ page }) => {
    const cards = page.locator('[data-testid="stream-summary-card"]')

    await expect(cards.first()).toBeVisible()
    await expect(cards.filter({ hasText: 'stream1' })).toHaveCount(1)
  })

  test('shows the totals summary and the filter input', async ({ page }) => {
    await expect(page.getByText(/\d+ streams? · \d+ recordings?/).first()).toBeVisible()
    await expect(page.getByRole('searchbox', { name: 'Filter streams' })).toBeVisible()
  })

  test('pressing / focuses the filter input', async ({ page }) => {
    const filter = page.getByRole('searchbox', { name: 'Filter streams' })
    await expect(filter).toBeVisible()

    await page.keyboard.press('/')

    await expect(filter).toBeFocused()
  })

  test('filters the grid client-side', async ({ page }) => {
    const cards = page.locator('[data-testid="stream-summary-card"]')
    const filter = page.getByRole('searchbox', { name: 'Filter streams' })
    await expect(cards.first()).toBeVisible()
    const allCount = await cards.count()

    await filter.fill('definitely-no-such-stream')
    await expect(cards).toHaveCount(0)
    await expect(page.getByText('No matching streams')).toBeVisible()

    await filter.clear()
    await expect(cards).toHaveCount(allCount)
  })
})

test.describe('Recording Detail Page', () => {
  test('renders an unknown stream without crashing', async ({ page }) => {
    await page.goto('/recordings/non-existent-stream')

    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible()
  })

  test('navigates to the detail page from the list', async ({ page }) => {
    await page.goto('/recordings')
    const card = page.locator('[data-testid="stream-summary-card"]').filter({ hasText: 'stream1' })

    await card.click()

    await expect(page).toHaveURL('/recordings/stream1')
  })

  test('groups recording rows by day', async ({ page }) => {
    await page.goto('/recordings/stream1')
    const rows = page.locator('[data-testid="recording-row"]')

    await expect(rows.first()).toBeVisible()
    await expect(rows.first().getByRole('button', { name: 'Play', exact: true })).toBeVisible()
    // Day-group eyebrow headers render above the rows.
    await expect(page.locator('section h2').first()).toBeVisible()
  })

  // The one recordings flow that genuinely needs a browser: a real <video>
  // element pulling real MP4 bytes over the Range requests media.serving.test.ts
  // covers at the header level.
  test('opens an inline player and tracks it in the URL', async ({ page }) => {
    await page.goto('/recordings/stream1')
    const row = page.locator('[data-testid="recording-row"]').first()
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Play', exact: true }).click()

    await expect(page).toHaveURL(/play=/)
    await expect(row.locator('video')).toBeVisible()

    await row.getByRole('button', { name: 'Close' }).click()
    await expect(page).not.toHaveURL(/play=/)
  })
})

test.describe('Recordings Navigation', () => {
  test('navigates back to the list from the detail breadcrumb', async ({ page }) => {
    await page.goto('/recordings/stream1')

    await page.getByRole('link', { name: 'Recordings', exact: true }).last().click()

    await expect(page).toHaveURL(/\/recordings$/)
  })

  test('shows the breadcrumb on the detail page', async ({ page }) => {
    await page.goto('/recordings/stream1')

    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible()
  })
})
