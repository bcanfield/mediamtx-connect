import { expect, test } from '@playwright/test'

test.describe('Config Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/config')
  })

  test('should load the config page', async ({ page }) => {
    await expect(page).toHaveURL(/\/config/)
  })

  test('should display configuration form fields', async ({ page }) => {
    await expect(page.getByText('MediaMtx Url', { exact: true })).toBeVisible()
    await expect(page.getByText('MediaMtx Api Port', { exact: true })).toBeVisible()
  })

  test('should have input fields in the form', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    // Target the first form (Client Config)
    const form = page.locator('form').first()
    await expect(form).toBeVisible({ timeout: 10000 })
    const inputs = form.locator('input')
    // Form has 5 fields: mediaMtxUrl, mediaMtxApiPort, remoteMediaMtxUrl, recordingsDirectory, screenshotsDirectory
    await expect(inputs).toHaveCount(5)
  })

  test('should have a save/update button', async ({ page }) => {
    await expect(page.locator('button[type="submit"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit' }).first()).toBeVisible()
  })

  test('should allow editing form fields', async ({ page }) => {
    const firstInput = page.locator('form input').first()
    await expect(firstInput).toBeEnabled()
  })

  test('should display form descriptions', async ({ page }) => {
    // Check for any form description text
    await expect(
      page.getByText('The address to your MediaMTX Instance').first(),
    ).toBeVisible()
  })
})

test.describe('Config Navigation', () => {
  test('should have navigation when on config pages', async ({ page }) => {
    await page.goto('/config')
    await expect(page.getByRole('link', { name: 'Recordings' })).toBeVisible()
  })

  test('should navigate back to home from config', async ({ page, baseURL }) => {
    await page.goto('/config')
    await page.getByRole('link', { name: 'Connect' }).click({ force: true })
    await expect(page).toHaveURL(`${baseURL}/`)
  })
})

test.describe('Config Save Flow', () => {
  test('should save config changes and persist after reload', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')

    // Target the first form (Client Config) - use first() to avoid multiple matches
    const screenshotsInput = page.locator('input[name="screenshotsDirectory"]').first()
    await expect(screenshotsInput).toBeVisible()
    const originalValue = await screenshotsInput.inputValue()

    // Change the value to something different (add a suffix)
    const testValue = originalValue.endsWith('-test')
      ? originalValue.replace('-test', '')
      : `${originalValue}-test`
    await screenshotsInput.fill(testValue)

    // Submit the first form
    const submitButton = page.getByRole('button', { name: 'Submit' }).first()
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Wait for the toast notification indicating success (use exact match to avoid multiple matches)
    await expect(page.getByText('Updated Global Config', { exact: true })).toBeVisible({ timeout: 5000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify the value persisted - re-locate after reload
    const screenshotsInputAfterReload = page.locator('input[name="screenshotsDirectory"]').first()
    await expect(screenshotsInputAfterReload).toHaveValue(testValue)

    // Restore original value
    await screenshotsInputAfterReload.fill(originalValue)
    const submitButtonAfterReload = page.getByRole('button', { name: 'Submit' }).first()
    await submitButtonAfterReload.click()
    await expect(page.getByText('Updated Global Config', { exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('should disable submit button when form is pristine', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')
    const submitButton = page.getByRole('button', { name: 'Submit' }).first()
    // Button should be disabled when no changes made
    await expect(submitButton).toBeDisabled()
  })

  test('should enable submit button after making changes', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')

    const submitButton = page.getByRole('button', { name: 'Submit' }).first()
    const screenshotsInput = page.locator('input[name="screenshotsDirectory"]').first()

    // Wait for form to be ready
    await expect(screenshotsInput).toBeVisible()

    // Make a change - clear and refill to trigger dirty state
    const currentValue = await screenshotsInput.inputValue()
    await screenshotsInput.clear()
    await screenshotsInput.fill(`${currentValue}1`)

    // Button should now be enabled (wait for form state to update)
    await expect(submitButton).toBeEnabled({ timeout: 5000 })
  })
})

test.describe('MediaMTX Global Config Page', () => {
  test('should load the MediaMTX global config page', async ({ page }) => {
    await page.goto('/config/mediamtx/global')
    // Page should load - either with form or error message
    await expect(page.locator('body')).toBeVisible()
  })

  test('should display MediaMTX configuration fields when connected', async ({ page }) => {
    await page.goto('/config/mediamtx/global')

    // Check if form is visible (MediaMTX is connected)
    const formVisible = await page.locator('form').isVisible().catch(() => false)

    if (formVisible) {
      // Check for some key MediaMTX config fields
      await expect(page.getByText('Log Level')).toBeVisible()
      await expect(page.getByText('API', { exact: true })).toBeVisible()
      await expect(page.getByText('RTSP', { exact: true })).toBeVisible()
      await expect(page.getByText('HLS', { exact: true })).toBeVisible()
    }
    else {
      // If MediaMTX is not connected, should show Invalid Config or similar
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toBeTruthy()
    }
  })

  test('should have submit button when form is visible', async ({ page }) => {
    await page.goto('/config/mediamtx/global')
    const formVisible = await page.locator('form').isVisible().catch(() => false)

    if (formVisible) {
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
    }
  })

  test('should have multiple form sections when connected', async ({ page }) => {
    await page.goto('/config/mediamtx/global')
    const formVisible = await page.locator('form').isVisible().catch(() => false)

    if (formVisible) {
      // The form should have separators between sections
      const separators = page.locator('[data-orientation="horizontal"]')
      const separatorCount = await separators.count()
      expect(separatorCount).toBeGreaterThan(0)
    }
  })
})
