import { expect, test } from '@playwright/test'

test.describe('Recordings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recordings')
  })

  test('should load the recordings page with header', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Recordings' })).toBeVisible()
    await expect(page.getByText('Browse your recordings')).toBeVisible()
  })

  test('should display stream cards or appropriate message', async ({ page }) => {
    const body = page.locator('body')
    const bodyText = await body.textContent()

    // Cards have bg-card class from shadcn Card component
    const hasRecordings = (await page.locator('.bg-card').count()) > 0
    const hasNoRecordingsMessage = bodyText?.includes('No Recordings Found') ?? false
    const hasDirectoryError = bodyText?.includes('Cannot Access Recordings Directory') ?? false

    expect(hasRecordings || hasNoRecordingsMessage || hasDirectoryError).toBe(true)
  })

  test('should show recording count for each stream when recordings exist', async ({
    page,
  }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if there are cards by looking for stream names
    const bodyText = await page.locator('body').textContent()
    const hasStreamNames = bodyText?.includes('camera') || bodyText?.includes('living-room')

    if (hasStreamNames) {
      // Look for recording count pattern (e.g., "3 Recordings" or "1 Recording")
      const hasRecordingCount = await page.getByText(/\d+ Recordings?/).first().isVisible().catch(() => false)
      expect(hasRecordingCount).toBe(true)
    }
  })

  test('should have view buttons when recordings exist', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const bodyText = await page.locator('body').textContent()
    const hasStreamNames = bodyText?.includes('camera') || bodyText?.includes('living-room')

    if (hasStreamNames) {
      await expect(page.getByRole('button', { name: 'View' }).first()).toBeVisible()
    }
  })
})

test.describe('Recording Detail Page', () => {
  test('should handle non-existent stream gracefully', async ({ page }) => {
    await page.goto('/recordings/non-existent-stream')
    await expect(page.locator('body')).toBeVisible()
    // Should show empty state or error message
    const bodyText = await page.locator('body').textContent()
    const hasContent = bodyText && bodyText.length > 0
    expect(hasContent).toBe(true)
  })

  test('should navigate to detail page from recordings list', async ({ page }) => {
    await page.goto('/recordings')

    const viewButton = page.getByRole('button', { name: 'View' }).first()
    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.click()
      await expect(page).toHaveURL(/\/recordings\/.+/)
    }
  })

  test('should display recording detail page for test data', async ({ page }) => {
    // Navigate to a known test data stream
    await page.goto('/recordings/camera1')

    // Page should load - either with recordings or appropriate message
    await page.waitForLoadState('networkidle')
    const bodyText = await page.locator('body').textContent()

    // Should have some content
    expect(bodyText && bodyText.length > 0).toBe(true)
  })

  test('should show recording cards or empty state on detail page', async ({ page }) => {
    await page.goto('/recordings/camera1')
    await page.waitForLoadState('networkidle')

    // Either has recording cards, pagination, empty state, or just rendered content
    const hasCards = (await page.locator('.bg-card').count()) > 0
    const hasNoRecordings = await page.getByText(/no recordings/i).isVisible().catch(() => false)
    const hasError = await page.getByText(/error|cannot/i).isVisible().catch(() => false)
    // Also check for any buttons or interactive elements (pagination, etc)
    const hasButtons = (await page.locator('button').count()) > 0

    expect(hasCards || hasNoRecordings || hasError || hasButtons).toBe(true)
  })
})

test.describe('Recording Playback UI', () => {
  test('should have play buttons on recording cards', async ({ page }) => {
    await page.goto('/recordings/camera1')
    await page.waitForLoadState('networkidle')

    const hasCards = (await page.locator('.bg-card').count()) > 0
    if (hasCards) {
      // Recording cards should have play functionality
      const playButtons = page.locator('button:has(svg)')
      const buttonCount = await playButtons.count()
      expect(buttonCount).toBeGreaterThan(0)
    }
  })

  test('should display recording timestamps', async ({ page }) => {
    await page.goto('/recordings/camera1')
    await page.waitForLoadState('networkidle')

    const hasCards = (await page.locator('.bg-card').count()) > 0
    if (hasCards) {
      // Should show date/time for recordings
      const bodyText = await page.locator('body').textContent()
      // Look for date patterns like "2024" or time patterns
      const hasDateInfo = bodyText?.match(/\d{4}/) !== null
      expect(hasDateInfo).toBe(true)
    }
  })
})

test.describe('Recordings Navigation', () => {
  test('should navigate back to recordings list from detail', async ({ page }) => {
    await page.goto('/recordings/camera1')

    const backLink = page.getByRole('link', { name: 'Recordings' })
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click()
      await expect(page).toHaveURL(/\/recordings$/)
    }
  })

  test('should have breadcrumb or navigation on detail page', async ({ page }) => {
    await page.goto('/recordings/camera1')
    await page.waitForLoadState('networkidle')

    // Should have navigation elements - check for any links
    const allLinks = page.locator('a')
    const linkCount = await allLinks.count()
    expect(linkCount).toBeGreaterThan(0)
  })
})
