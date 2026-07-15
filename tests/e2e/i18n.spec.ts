import { expect, test } from '@playwright/test'

// Locale is a client-side setting (localStorage) in the SPA — there is no
// URL locale prefix. These tests drive the sidebar locale switcher.
test.describe('Internationalization', () => {
  test('serves English by default', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h2').filter({ hasText: 'Streams' })).toBeVisible({ timeout: 10000 })
  })

  test('switches to Spanish via the locale switcher', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('h2').filter({ hasText: 'Transmisiones' })).toBeVisible({ timeout: 10000 })
  })

  test('persists the locale across reloads', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('h2').filter({ hasText: 'Transmisiones' })).toBeVisible({ timeout: 10000 })
  })

  test('translates the sidebar nav for Spanish', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    const sidebar = page.locator('[data-slot="sidebar"], aside, [data-sidebar="sidebar"]').first()
    await expect(sidebar.getByText('Aplicación')).toBeVisible()
    await expect(sidebar.getByText('En vivo').first()).toBeVisible()
  })

  test('preserves the route when switching locales', async ({ page }) => {
    await page.goto('/recordings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h2').filter({ hasText: 'Recordings' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    await expect(page).toHaveURL(/\/recordings/)
    await expect(page.locator('h2').filter({ hasText: 'Grabaciones' })).toBeVisible({ timeout: 10000 })
  })
})
