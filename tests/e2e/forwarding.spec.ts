// E2E because it needs a live MediaMTX write: only a real server can show that
// a saved `forward` destination starts receiving the stream, and that writing
// it hot-reloads the source path instead of restarting it.
import type { APIRequestContext } from '@playwright/test'
import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// A static entry of its own, so the save is a PATCH rather than a materialize,
// and no fixture stream (stream1…stream5, owned by other specs) is touched.
const SRC = 'e2e-forward-src'

// Rides `all_others`. Inside the MediaMTX container localhost:8554 is MediaMTX
// itself, so the forward loops back with no second server.
const DST = 'e2e-forward-dst'
const DEST_URL = `rtsp://localhost:8554/${DST}`

// MediaMTX restarts its API listener on any config write, which drops pooled
// sockets mid-request (see patchGlobal in publish-urls.spec.ts). Every raw call
// here retries until it gets a fresh one. A retry can follow a call that landed
// but whose answer was dropped, so `alsoDone` names the status that means the
// earlier attempt already did the job.
async function untilOk(send: () => Promise<{ ok: () => boolean, status: () => number }>, alsoDone?: number) {
  await expect.poll(async () => {
    try {
      const res = await send()
      return res.ok() || res.status() === alsoDone
    }
    catch {
      return false
    }
  }).toBe(true)
}

// The runtime path; `gone` once MediaMTX isn't running it (404), and undefined
// while its API is mid-restart, so a dropped socket never reads as "stopped".
async function runtimePath(request: APIRequestContext, name: string) {
  try {
    const res = await request.get(`${API}/paths/get/${name}`)
    if (res.status() === 404)
      return 'gone' as const
    return res.ok() ? await res.json() as { ready: boolean, readyTime: string | null } : undefined
  }
  catch {
    return undefined
  }
}

async function isReady(request: APIRequestContext, name: string) {
  const path = await runtimePath(request, name)
  if (path === 'gone')
    return false
  return path?.ready
}

test.describe('Forwarding', () => {
  test('forwards a path to a destination and stops when it is removed, without a restart', async ({ page, request }) => {
    // Left over from an earlier run that died before its `finally`.
    await untilOk(() => request.delete(`${API}/config/paths/delete/${SRC}`), 404)
    // 400 is "path already exists": an earlier attempt landed.
    await untilOk(() => request.post(`${API}/config/paths/add/${SRC}`, {
      data: {
        runOnInit: 'ffmpeg -re -f lavfi -i testsrc=size=640x360:rate=15 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -g 30 -f rtsp rtsp://localhost:$RTSP_PORT/$MTX_PATH',
        runOnInitRestart: true,
      },
    }), 400)
    try {
      await expect.poll(() => isReady(request, SRC), { timeout: 30_000 }).toBe(true)
      const readyTimeOf = async () => {
        const path = await runtimePath(request, SRC)
        return path === 'gone' ? null : path?.readyTime
      }
      let readyTime: string | null | undefined
      await expect.poll(async () => (readyTime = await readyTimeOf())).toBeTruthy()

      await page.goto(`/config/mediamtx/paths/${SRC}`)
      await page.getByRole('button', { name: 'Add destination' }).click()
      const dest = page.getByLabel('Destination 1')
      await dest.fill(DEST_URL)
      await dest.blur()
      await page.getByTestId('save-bar').getByRole('button', { name: 'Save to server' }).click()
      await expect(page.getByTestId('save-bar')).toBeHidden()

      await expect.poll(() => isReady(request, DST), { timeout: 20_000 }).toBe(true)
      // `forward` is hot-reloaded: the source kept its session.
      await expect.poll(readyTimeOf).toBe(readyTime)

      await page.getByRole('button', { name: 'Remove destination 1' }).click()
      await page.getByTestId('save-bar').getByRole('button', { name: 'Save to server' }).click()
      await expect(page.getByTestId('save-bar')).toBeHidden()

      await expect.poll(() => isReady(request, DST), { timeout: 20_000 }).toBe(false)
    }
    finally {
      await untilOk(() => request.delete(`${API}/config/paths/delete/${SRC}`), 404)
    }
  })
})
