import { expect, test } from '@playwright/test'

// Locale is a client-side setting (localStorage) in the SPA — there is no
// URL locale prefix. These tests drive the header locale switcher.
test.describe('Internationalization', () => {
  test('serves English by default', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('link', { name: 'Recordings', exact: true })).toBeVisible()
  })

  test('switches to Spanish via the locale switcher', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.getByRole('link', { name: 'Grabaciones', exact: true })).toBeVisible({ timeout: 10000 })
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
    await expect(page.getByRole('link', { name: 'Grabaciones', exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('translates the top nav for Spanish', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    const nav = page.locator('header nav')
    await expect(nav.getByText('En vivo')).toBeVisible()
    await expect(nav.getByText('Grabaciones')).toBeVisible()
  })

  test('preserves the route when switching locales', async ({ page }) => {
    await page.goto('/config')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'App Config' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    await expect(page).toHaveURL(/\/config/)
    await expect(page.getByRole('heading', { name: 'Configuración de la app' })).toBeVisible({ timeout: 10000 })
  })
})
