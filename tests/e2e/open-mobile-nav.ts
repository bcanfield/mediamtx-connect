import type { Page } from '@playwright/test'

export async function openMobileNavIfNeeded(page: Page) {
  if ((page.viewportSize()?.width ?? 0) < 640) {
    // shadcn's SidebarTrigger marks itself with data-sidebar="trigger".
    // Stable across aria-label changes (Open/Close vs. Toggle).
    await page.locator('[data-sidebar="trigger"]').first().click()
    // Wait for the mobile Sheet to finish sliding in. Without this the next
    // click can race the animation and Playwright sees the link as
    // out-of-viewport.
    await page
      .locator('[data-sidebar="sidebar"][data-mobile="true"]')
      .waitFor({ state: 'visible' })
  }
}

// In the Sidebar primitive every nav row is a Link inside a SidebarMenuButton,
// so we just look up by accessible link name.
export function getNavItem(page: Page, name: string) {
  return page.getByRole('link', { name, exact: true }).first()
}
