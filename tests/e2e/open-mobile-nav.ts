import type { Page } from '@playwright/test'

export async function openMobileNavIfNeeded(page: Page) {
  if ((page.viewportSize()?.width ?? 0) < 640) {
    // shadcn Sidebar exposes a trigger with aria-label "Toggle Sidebar".
    await page.getByRole('button', { name: 'Toggle Sidebar' }).first().click()
  }
}

// In the Sidebar primitive every nav row is a Link inside a SidebarMenuButton,
// so we just look up by accessible link name.
export function getNavItem(page: Page, name: string) {
  return page.getByRole('link', { name, exact: true }).first()
}
