import type { Page } from '@playwright/test'

// The top-nav tab row is always rendered (it scrolls horizontally on
// mobile), so nav items are plain links looked up by accessible name.
export function getNavItem(page: Page, name: string) {
  return page.getByRole('link', { name, exact: true }).first()
}
