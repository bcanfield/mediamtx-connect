import { expect, test } from '@playwright/test'
import { getNavItem } from './open-mobile-nav'

test.describe('App Config Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/config')
  })

  test('should load the config page', async ({ page }) => {
    await expect(page).toHaveURL(/\/config/)
    await expect(page.getByRole('heading', { name: 'App Config' })).toBeVisible()
  })

  test('should display configuration form fields', async ({ page }) => {
    await expect(page.getByText('MediaMTX URL', { exact: true })).toBeVisible()
    await expect(page.getByText('API port', { exact: true })).toBeVisible()
    await expect(page.getByText('Playback URL', { exact: true })).toBeVisible()
  })

  test('should have input fields in the form', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const form = page.locator('form').first()
    await expect(form).toBeVisible({ timeout: 10000 })
    const inputs = form.locator('input')
    // Form has 5 fields: mediaMtxUrl, mediaMtxApiPort, remoteMediaMtxUrl, recordingsDirectory, screenshotsDirectory
    await expect(inputs).toHaveCount(5)
  })

  test('should show the hero playback badge', async ({ page }) => {
    await expect(page.getByText('Required for live playback')).toBeVisible()
  })

  test('should allow editing form fields', async ({ page }) => {
    const firstInput = page.locator('form input').first()
    await expect(firstInput).toBeEnabled()
  })

  test('should display form descriptions', async ({ page }) => {
    await expect(
      page.getByText('The address of your MediaMTX instance').first(),
    ).toBeVisible()
  })
})

test.describe('Config Navigation', () => {
  test('should have navigation when on config pages', async ({ page }) => {
    await page.goto('/config')
    await expect(getNavItem(page, 'Recordings')).toBeVisible()
  })

  test('should navigate back to home from config', async ({ page, baseURL }) => {
    await page.goto('/config')
    await getNavItem(page, 'Live').click({ force: true })
    await expect(page).toHaveURL(`${baseURL}/`)
  })
})

test.describe('Config Save Flow', () => {
  test('should save config changes and persist after reload', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')

    const screenshotsInput = page.locator('input[name="screenshotsDirectory"]').first()
    await expect(screenshotsInput).toBeVisible()
    const originalValue = await screenshotsInput.inputValue()

    const testValue = originalValue.endsWith('-test')
      ? originalValue.replace('-test', '')
      : `${originalValue}-test`
    await screenshotsInput.fill(testValue)

    // The save bar mounts only once the form is dirty.
    const saveBar = page.getByTestId('save-bar')
    await expect(saveBar).toBeVisible({ timeout: 5000 })
    const submitButton = saveBar.getByRole('button', { name: 'Save', exact: true })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    await expect(page.getByText('App Config saved', { exact: true })).toBeVisible({ timeout: 5000 })

    await page.reload()
    await page.waitForLoadState('networkidle')

    const screenshotsInputAfterReload = page.locator('input[name="screenshotsDirectory"]').first()
    await expect(screenshotsInputAfterReload).toHaveValue(testValue)

    // Restore original value
    await screenshotsInputAfterReload.fill(originalValue)
    const submitAfterReload = page.getByTestId('save-bar').getByRole('button', { name: 'Save', exact: true })
    await submitAfterReload.click()
    await expect(page.getByText('App Config saved', { exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('should not show the save bar when the form is pristine', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('form').first()).toBeVisible()
    await expect(page.getByTestId('save-bar')).toHaveCount(0)
  })

  test('should show the save bar after making changes', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')

    const screenshotsInput = page.locator('input[name="screenshotsDirectory"]').first()
    await expect(screenshotsInput).toBeVisible()

    const currentValue = await screenshotsInput.inputValue()
    await screenshotsInput.clear()
    await screenshotsInput.fill(`${currentValue}1`)

    await expect(page.getByTestId('save-bar')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/1 unsaved change/).first()).toBeVisible()
  })
})

test.describe('MediaMTX Global Config Page', () => {
  test('should load the MediaMTX global config page', async ({ page }) => {
    await page.goto('/config/mediamtx/global')
    await expect(page.getByRole('heading', { name: 'MediaMTX Config' })).toBeVisible()
  })

  test('should display MediaMTX config keys verbatim when connected', async ({ page }) => {
    await page.goto('/config/mediamtx/global')

    const formVisible = await page.locator('form').isVisible().catch(() => false)

    if (formVisible) {
      // Field labels are MediaMTX config keys, verbatim and never localized.
      await expect(page.getByText('logLevel', { exact: true })).toBeVisible()
      await expect(page.getByText('rtspAddress', { exact: true })).toBeVisible()
      await expect(page.getByText('hlsAddress', { exact: true })).toBeVisible()
    }
    else {
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toBeTruthy()
    }
  })

  test('should reveal the pending-changes bar after editing when form is visible', async ({ page }) => {
    await page.goto('/config/mediamtx/global')
    const formVisible = await page.locator('form').isVisible().catch(() => false)

    if (formVisible) {
      const logLevel = page.locator('input[name="logLevel"]').first()
      await expect(logLevel).toBeVisible()
      await logLevel.fill('debug')

      const saveBar = page.getByTestId('save-bar')
      await expect(saveBar).toBeVisible({ timeout: 5000 })
      // Dirty keys surface as mono chips by config key name.
      await expect(saveBar.getByText('logLevel')).toBeVisible()
      await expect(saveBar.getByRole('button', { name: 'Save to server' })).toBeVisible()
    }
  })

  test('should render the section rail when connected', async ({ page }) => {
    await page.goto('/config/mediamtx/global')
    const formVisible = await page.locator('form').isVisible().catch(() => false)

    if (formVisible) {
      const rail = page.getByRole('navigation', { name: 'Config sections' }).last()
      await expect(rail.getByRole('button', { name: 'Logging' })).toBeVisible()
      await expect(rail.getByRole('button', { name: 'WebRTC' })).toBeVisible()
    }
  })
})
