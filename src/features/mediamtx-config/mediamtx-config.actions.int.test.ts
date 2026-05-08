import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '@/lib/db'

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}))

const { updateGlobalConfig } = await import('./mediamtx-config.actions')

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

beforeEach(async () => {
  server.resetHandlers()
  await db.config.deleteMany()
})

afterAll(async () => {
  server.close()
  await db.$disconnect()
})

async function seedConfig() {
  return db.config.create({
    data: {
      mediaMtxUrl: 'http://mediamtx',
      mediaMtxApiPort: 9997,
      recordingsDirectory: '/recordings',
      screenshotsDirectory: '/screenshots',
    },
  })
}

describe('updateGlobalConfig', () => {
  it('returns false when no Config row exists (skips MediaMTX call)', async () => {
    expect(await updateGlobalConfig({ globalConfig: { logLevel: 'info' } })).toBe(false)
  })

  it('issues a PATCH to MediaMTX with the supplied config and returns true on 200', async () => {
    await seedConfig()
    let receivedBody: unknown
    server.use(
      http.patch('http://mediamtx:9997/v3/config/global/patch', async ({ request }) => {
        receivedBody = await request.json()
        return new HttpResponse(null, { status: 200 })
      }),
    )

    const ok = await updateGlobalConfig({ globalConfig: { logLevel: 'debug', hls: false } })
    expect(ok).toBe(true)
    expect(receivedBody).toEqual({ logLevel: 'debug', hls: false })
  })

  it('returns false when MediaMTX returns a non-200', async () => {
    await seedConfig()
    server.use(
      http.patch('http://mediamtx:9997/v3/config/global/patch', () =>
        HttpResponse.json({ error: 'invalid' }, { status: 400 })),
    )
    expect(await updateGlobalConfig({ globalConfig: { logLevel: 'info' } })).toBe(false)
  })

  it('returns false when MediaMTX is unreachable', async () => {
    await seedConfig()
    server.use(
      http.patch('http://mediamtx:9997/v3/config/global/patch', () => HttpResponse.error()),
    )
    expect(await updateGlobalConfig({ globalConfig: { logLevel: 'info' } })).toBe(false)
  })
})
