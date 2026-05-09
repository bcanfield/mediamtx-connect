import { expect, test } from '@playwright/test'

test.describe('Internationalization', () => {
  test('serves English at /', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h2').filter({ hasText: 'Streams' })).toBeVisible({ timeout: 10000 })
  })

  test('serves Spanish at /es', async ({ page }) => {
    await page.goto('/es')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('h2').filter({ hasText: 'Transmisiones' })).toBeVisible({ timeout: 10000 })
  })

  test('translates the sidebar nav for Spanish', async ({ page }) => {
    await page.goto('/es')
    await page.waitForLoadState('networkidle')
    const sidebar = page.locator('[data-slot="sidebar"], aside').first()
    await expect(sidebar.getByText('Aplicación')).toBeVisible()
    await expect(sidebar.getByText('En vivo').first()).toBeVisible()
  })

  test('preserves the route when switching locales via direct navigation', async ({ page }) => {
    await page.goto('/recordings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h2').filter({ hasText: 'Recordings' })).toBeVisible({ timeout: 10000 })

    await page.goto('/es/recordings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h2').filter({ hasText: 'Grabaciones' })).toBeVisible({ timeout: 10000 })
  })
})
