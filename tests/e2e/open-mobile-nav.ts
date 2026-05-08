import type { Page } from '@playwright/test'

export async function openMobileNavIfNeeded(page: Page) {
  if ((page.viewportSize()?.width ?? 0) < 640) {
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
  }
}
