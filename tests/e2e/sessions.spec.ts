import type { APIRequestContext } from '@playwright/test'
import { expect, test } from '@playwright/test'

const API = 'http://localhost:9997/v3'

// Needs a live MediaMTX: a real RTSP reader has to exist for the page to list
// and for the kick to disconnect.
//
// The reader is ours, not a fixture publisher. ffmpeg-test.sh publishes
// stream1…stream5 once and never reconnects, so kicking one would delete that
// stream for every later spec.
const READER_PATH = 'e2e-sessions-reader'
const STREAM = 'stream5'
const QUERY = 'e2e=sessions'

interface RtspSession { id: string, remoteAddr: string, path: string, query: string }

// MediaMTX restarts its API listener on any config write, ours or another
// spec's, so a pooled socket can die with "socket hang up". Retrying gets a
// fresh one (see publish-urls.spec.ts).
async function untilOk(send: () => Promise<{ ok: () => boolean }>) {
  await expect.poll(async () => {
    try {
      return (await send()).ok()
    }
    catch {
      return false
    }
  }).toBe(true)
}

// Null when the list couldn't be read, so a poll can't mistake a dropped
// socket for the reader being gone.
async function ourReaders(request: APIRequestContext): Promise<RtspSession[] | null> {
  try {
    const res = await request.get(`${API}/rtspsessions/list`)
    const body = await res.json() as { items: RtspSession[] }
    return body.items.filter(s => s.query === QUERY)
  }
  catch {
    return null
  }
}

// Not idempotent like a patch: an add that landed but lost its response socket
// makes the retry answer "path already exists". After a first attempt, that
// answer means our earlier add went through.
async function addReaderPath(request: APIRequestContext) {
  let attempted = false
  await expect.poll(async () => {
    try {
      const res = await request.post(`${API}/config/paths/add/${READER_PATH}`, {
        data: {
          runOnInit: `ffmpeg -rtsp_transport tcp -i 'rtsp://localhost:$RTSP_PORT/${STREAM}?${QUERY}' -c copy -f null -`,
          runOnInitRestart: false,
        },
      })
      if (res.ok())
        return true
      const alreadyExists = res.status() === 400 && (await res.text()).includes('already exists')
      return attempted && alreadyExists
    }
    catch {
      return false
    }
    finally {
      attempted = true
    }
  }).toBe(true)
}

test('kicks an RTSP reader from the sessions page', async ({ page, request }) => {
  await addReaderPath(request)
  try {
    let reader: RtspSession | undefined
    await expect.poll(async () => {
      reader = (await ourReaders(request))?.[0]
      return reader
    }, { timeout: 15_000 }).toBeDefined()

    await page.goto('/sessions')
    const row = page.getByRole('row').filter({ hasText: reader!.remoteAddr })
    await expect(row).toBeVisible()
    await expect(row.getByRole('cell').nth(0)).toHaveText(STREAM)
    await expect(row.getByRole('cell').nth(3)).toHaveText('read')

    await row.getByRole('button', { name: 'Kick' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Kick client' }).click()

    await expect(row).toHaveCount(0)
    await expect.poll(async () => (await ourReaders(request))?.some(s => s.id === reader!.id)).toBe(false)
  }
  finally {
    await untilOk(() => request.delete(`${API}/config/paths/delete/${READER_PATH}`))
  }
})
