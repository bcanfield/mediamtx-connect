import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// Deliberately NOT stream1: path-config.spec.ts materializes and deletes
// stream1's entry, and fullyParallel would race the two files over it.
const STREAM = 'stream2'

// Any other wildcard-backed stream, to prove one card's toggle stays local.
const OTHER = 'stream3'

function cardFor(page: Page, name: string) {
  return page.locator('[data-testid="stream-card"]').filter({ hasText: name })
}

test.describe('Stream card record toggle', () => {
  // Both tests read stream2's record state, and toggling materializes an entry
  // that changes what the other one sees.
  test.describe.configure({ mode: 'serial' })

  // The toggle materializes an entry in live MediaMTX. Deleting it here means a
  // mid-test failure can't leave stream2 pinned to its own entry — and, worse,
  // pinned to record:false — for the next run.
  let materialized = false

  test.afterEach(async ({ request }) => {
    if (!materialized)
      return
    await request.delete(`${API}/config/paths/delete/${STREAM}`)
    materialized = false
  })

  test('shows record state inherited from path defaults', async ({ page, request }) => {
    // The stock setup, asserted rather than assumed: recording is on in path
    // defaults and stream2 has no entry of its own. A card that reported only
    // the stream's own (absent) override would say OFF here while MediaMTX
    // writes files to disk — the bug this test exists to catch.
    const defaults = await (await request.get(`${API}/config/pathdefaults/get`)).json()
    expect(defaults.record).toBe(true)
    const runtime = await (await request.get(`${API}/paths/get/${STREAM}`)).json()
    expect(runtime.confName).toBe('all_others')

    await page.goto('/')
    const card = cardFor(page, STREAM)
    await expect(card.getByText('REC')).toBeVisible()

    await card.getByRole('button', { name: 'Stream actions' }).click()
    await expect(page.getByRole('menuitem', { name: 'Record ON' })).toBeVisible()
  })

  test('toggling one stream writes its own override and nothing else', async ({ page, request }) => {
    const before = await (await request.get(`${API}/paths/get/${STREAM}`)).json()
    expect(before.ready).toBe(true)

    await page.goto('/')
    const card = cardFor(page, STREAM)
    await expect(card.getByText('REC')).toBeVisible()

    materialized = true
    await card.getByRole('button', { name: 'Stream actions' }).click()
    // No longer a stub: this writes, rather than toasting "Not implemented yet".
    await page.getByRole('menuitem', { name: 'Record ON' }).click()
    await expect(card.getByText('REC')).toBeHidden()

    // Wildcard-backed until now, so the write had to materialize an entry.
    const after = await (await request.get(`${API}/paths/get/${STREAM}`)).json()
    expect(after.confName).toBe(STREAM)
    const entry = await (await request.get(`${API}/config/paths/get/${STREAM}`)).json()
    expect(entry.record).toBe(false)

    // Materializing must not restart the session: same publisher, same uptime.
    expect(after.ready).toBe(true)
    expect(after.readyTime).toBe(before.readyTime)

    // Path defaults are the other place `record` lives, and every stream on the
    // server inherits them — writing them from a card is the blast-radius bug.
    const defaults = await (await request.get(`${API}/config/pathdefaults/get`)).json()
    expect(defaults.record).toBe(true)
    const wildcard = await (await request.get(`${API}/config/paths/get/all_others`)).json()
    expect(wildcard.record).toBe(true)

    // Every other stream still resolves through that untouched wildcard entry.
    await expect(cardFor(page, OTHER).getByText('REC')).toBeVisible()
  })

  test('starting recording patches an entry the stream already has', async ({ page, request }) => {
    // The other half of "start or stop": a stream that already has an entry
    // takes the patch branch, not the materialize branch the test above drives.
    materialized = true
    await request.post(`${API}/config/paths/add/${STREAM}`, { data: { record: false } })

    await page.goto('/')
    const card = cardFor(page, STREAM)
    await expect(card.getByText('REC')).toBeHidden()

    await card.getByRole('button', { name: 'Stream actions' }).click()
    await page.getByRole('menuitem', { name: 'Record OFF' }).click()
    await expect(card.getByText('REC')).toBeVisible()

    const entry = await (await request.get(`${API}/config/paths/get/${STREAM}`)).json()
    expect(entry.record).toBe(true)
    // Patched in place — turning recording on must not disturb the publisher.
    const after = await (await request.get(`${API}/paths/get/${STREAM}`)).json()
    expect(after.ready).toBe(true)
  })
})
