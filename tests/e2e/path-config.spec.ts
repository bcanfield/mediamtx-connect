import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// stream1 is wildcard-backed (confName `all_others`) — the normal case per
// ADR 0002, and the one this page exists to handle.
const STREAM = 'stream1'

test.describe('MediaMTX Path Config Page', () => {
  // Every test here reads or writes stream1's one config entry, and
  // materializing it changes what the read tests see. fullyParallel would race
  // them against each other over that single shared entry.
  test.describe.configure({ mode: 'serial' })

  // The round-trip materializes an entry in live MediaMTX. It deletes it
  // through the API afterwards, so a mid-test failure can't leave stream1
  // pinned to its own entry for the next spec.
  let materialized = false

  test.beforeEach(async ({ page }) => {
    await page.goto(`/config/mediamtx/paths/${STREAM}`)
  })

  test.afterEach(async ({ request }) => {
    if (!materialized)
      return
    await request.delete(`${API}/config/paths/delete/${STREAM}`)
    materialized = false
  })

  test('should load the path config page for a stream', async ({ page }) => {
    await expect(page.getByRole('heading', { name: `Path Config · ${STREAM}` })).toBeVisible()
  })

  test('should show effective config inherited from the wildcard entry', async ({ page }) => {
    // The values come from path defaults via `all_others`; stream1 has no entry
    // of its own, so resolving them at all is the point of the read path.
    await expect(page.getByText('currently inherited from all_others')).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Recording' })).toBeChecked()
    await expect(page.getByRole('textbox', { name: 'recordPath' })).not.toBeEmpty()
  })

  test('should materialize a sparse entry on save and keep tracking defaults', async ({ page, request }) => {
    const before = await (await request.get(`${API}/paths/get/${STREAM}`)).json()
    expect(before.confName).toBe('all_others')

    const field = page.getByRole('textbox', { name: 'recordDeleteAfter' })
    // MediaMTX re-formats durations it parses ("48h0m0s" reads back as "2d"),
    // so assert with a value it stores verbatim.
    const inherited = await field.inputValue()
    const target = inherited === '3d' ? '4d' : '3d'

    materialized = true
    await field.fill(target)
    await field.blur()
    await page.getByTestId('save-bar').getByRole('button', { name: 'Save to server' }).click()
    await expect(page.getByTestId('save-bar')).toBeHidden()

    await page.reload()
    await expect(page.getByRole('textbox', { name: 'recordDeleteAfter' })).toHaveValue(target)
    // The page now reads stream1's own entry, so the inheritance note is gone.
    await expect(page.getByText('currently inherited from')).toBeHidden()

    const after = await (await request.get(`${API}/paths/get/${STREAM}`)).json()
    expect(after.confName).toBe(STREAM)
    // Materializing must not restart the session: same publisher, same uptime.
    expect(after.ready).toBe(true)
    expect(after.readyTime).toBe(before.readyTime)

    const defaults = await (await request.get(`${API}/config/pathdefaults/get`)).json()
    const entry = await (await request.get(`${API}/config/paths/get/${STREAM}`)).json()
    expect(entry.recordDeleteAfter).toBe(target)

    // Changing a default and watching it reach the stream is the only way to
    // prove the entry is a sparse override: config/paths/get resolves defaults
    // into what it returns, so comparing it against pathdefaults would pass
    // just as well against a full snapshot of them.
    const nextFormat = defaults.recordFormat === 'fmp4' ? 'mpegts' : 'fmp4'
    await request.patch(`${API}/config/pathdefaults/patch`, { data: { recordFormat: nextFormat } })
    try {
      await page.reload()
      await expect(page.getByRole('textbox', { name: 'recordFormat' })).toHaveValue(nextFormat)
      await expect(page.getByRole('textbox', { name: 'recordDeleteAfter' })).toHaveValue(target)
    }
    finally {
      await request.patch(`${API}/config/pathdefaults/patch`, {
        data: { recordFormat: defaults.recordFormat },
      })
    }
  })
})
