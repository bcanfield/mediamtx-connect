import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = [
  { name: 'Streams', path: '/' },
  { name: 'Recordings', path: '/recordings' },
  { name: 'Client Config', path: '/config' },
  { name: 'MediaMTX Global Config', path: '/config/mediamtx/global' },
  { name: 'MediaMTX Path Defaults', path: '/config/mediamtx/path-defaults' },
] as const

for (const { name, path } of pages) {
  test(`${name} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = result.violations.filter(v =>
      v.impact === 'serious' || v.impact === 'critical',
    )

    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}
