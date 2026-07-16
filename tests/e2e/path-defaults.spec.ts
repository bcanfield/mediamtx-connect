import { expect, test } from '@playwright/test'

const PATH_DEFAULTS_API = 'http://localhost:9997/v3/config/pathdefaults'

test.describe('MediaMTX Path Defaults Page', () => {
  // The round-trip test writes to live MediaMTX. It reverts through the UI as
  // part of the assertion, but record what it touched so a mid-test failure
  // can't leak a mutated value into the next spec.
  let touched: string | null = null

  test.beforeEach(async ({ page }) => {
    await page.goto('/config/mediamtx/path-defaults')
  })

  test.afterEach(async ({ request }) => {
    if (touched === null)
      return
    await request.patch(`${PATH_DEFAULTS_API}/patch`, { data: { recordDeleteAfter: touched } })
    touched = null
  })

  test('should load the path defaults page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Path Defaults' })).toBeVisible()
  })

  test('should display the recording config keys', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recording' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Recording' })).toBeChecked()
    await expect(page.getByRole('textbox', { name: 'recordPath' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'recordFormat' })).toBeVisible()
  })

  test('should round-trip a path defaults edit', async ({ page }) => {
    // The Recording section hides its fields while `record` is off, so assert
    // the precondition directly — mediamtx.yml pins `record: yes` for dev/CI.
    await expect(page.getByRole('switch', { name: 'Recording' })).toBeChecked()

    const field = page.getByRole('textbox', { name: 'recordDeleteAfter' })
    await expect(field).toBeVisible()

    // MediaMTX re-formats durations it parses ("48h0m0s" reads back as "2d"),
    // so assert with a value it stores verbatim.
    const original = await field.inputValue()
    const target = original === '3d' ? '4d' : '3d'
    touched = original

    await field.fill(target)
    await field.blur()
    await page.getByTestId('save-bar').getByRole('button', { name: 'Save to server' }).click()
    await expect(page.getByTestId('save-bar')).toBeHidden()

    await page.reload()
    await expect(page.getByRole('textbox', { name: 'recordDeleteAfter' })).toHaveValue(target)

    await field.fill(original)
    await field.blur()
    await page.getByTestId('save-bar').getByRole('button', { name: 'Save to server' }).click()
    await expect(page.getByTestId('save-bar')).toBeHidden()

    await page.reload()
    await expect(page.getByRole('textbox', { name: 'recordDeleteAfter' })).toHaveValue(original)
    touched = null
  })
})
