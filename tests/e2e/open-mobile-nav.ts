import type { Page } from '@playwright/test'

export async function openMobileNavIfNeeded(page: Page) {
  if ((page.viewportSize()?.width ?? 0) < 640) {
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
  }
}

// On mobile the nav items are Radix DropdownMenuItems (role="menuitem");
// on desktop they are plain Next.js Links (role="link").
export function getNavItem(page: Page, name: string) {
  return page
    .getByRole('link', { name, exact: true })
    .or(page.getByRole('menuitem', { name, exact: true }))
    .first()
}
