import type { APIRequestContext, APIResponse, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// MediaMTX restarts its API listener on every path config write, so a pooled
// socket can die mid-request (see publish-urls.spec.ts). Retrying gets a fresh
// one and rides out the moment the listener is down, so every call through
// here has to be safe to repeat. `done` says which statuses count as success.
async function mediamtx(
  send: () => Promise<APIResponse>,
  done: (response: APIResponse) => boolean = response => response.ok(),
): Promise<APIResponse> {
  let response: APIResponse | undefined
  await expect.poll(async () => {
    try {
      response = await send()
      return done(response)
    }
    catch {
      return false
    }
  }).toBe(true)
  return response!
}

// `replace` creates the entry or overwrites it, so a retry after an add that
// landed but lost its response doesn't come back "already exists".
function putPath(request: APIRequestContext, name: string, data: Record<string, unknown>) {
  return mediamtx(() => request.post(`${API}/config/paths/replace/${name}`, { data }))
}

// A retry after a delete that landed sees 404, which is the same outcome.
function deletePath(request: APIRequestContext, name: string) {
  return mediamtx(
    () => request.delete(`${API}/config/paths/delete/${name}`),
    response => response.ok() || response.status() === 404,
  )
}

function saveButton(page: Page) {
  return page.getByTestId('save-bar').getByRole('button', { name: 'Save to server' })
}

test.describe('Path resilience', () => {
  // Both paths are this spec's own, never a fixture stream: any of these keys
  // makes MediaMTX re-create the path, which would drop a fixture's publisher.
  test('pulls a source on demand and refuses a fallback with nothing to play', async ({ page, request }) => {
    const suffix = `${test.info().workerIndex}-${Date.now()}`
    const pulled = `e2e-on-demand-${suffix}`
    const published = `e2e-always-available-${suffix}`

    try {
      await putPath(request, pulled, { source: 'rtsp://localhost:8554/stream1' })
      // An empty body leaves `source` at publisher and sourceOnDemand off. On
      // the pulled path MediaMTX would refuse alwaysAvailable for clashing with
      // sourceOnDemand instead.
      await putPath(request, published, {})

      await page.goto(`/config/mediamtx/paths/${pulled}`)
      await page.getByRole('switch', { name: 'sourceOnDemand' }).click()
      const closeAfter = page.getByRole('textbox', { name: 'sourceOnDemandCloseAfter' })
      await closeAfter.fill('30s')
      await closeAfter.blur()
      await saveButton(page).click()
      await expect(page.getByTestId('save-bar')).toBeHidden()

      await expect.poll(async () => {
        const entry = await (await mediamtx(() => request.get(`${API}/config/paths/get/${pulled}`))).json()
        return [entry.sourceOnDemand, entry.sourceOnDemandCloseAfter]
      }).toEqual([true, '30s'])

      await page.goto(`/config/mediamtx/paths/${published}`)
      await page.getByRole('switch', { name: 'alwaysAvailable' }).click()
      await saveButton(page).click()

      await expect(page.getByTestId('field-alwaysAvailable'))
        .toContainText('\'alwaysAvailableTracks\' must contain at least one track')
    }
    finally {
      // Independent, so one failed cleanup can't leave the other path behind.
      const cleanups = await Promise.allSettled([deletePath(request, pulled), deletePath(request, published)])
      expect(cleanups.filter(cleanup => cleanup.status === 'rejected')).toEqual([])
    }
  })
})
