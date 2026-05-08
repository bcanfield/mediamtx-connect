import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '@/lib/db'

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}))

const { getGlobalConfig } = await import('./mediamtx-config.queries')

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

async function seedConfig(overrides: Partial<{ mediaMtxUrl: string, mediaMtxApiPort: number }> = {}) {
  return db.config.create({
    data: {
      mediaMtxUrl: 'http://mediamtx',
      mediaMtxApiPort: 9997,
      recordingsDirectory: '/recordings',
      screenshotsDirectory: '/screenshots',
      ...overrides,
    },
  })
}

describe('getGlobalConfig', () => {
  it('returns undefined when no Config row exists (skips MediaMTX call)', async () => {
    expect(await getGlobalConfig()).toBeUndefined()
  })

  it('fetches the GlobalConf using the configured baseUrl', async () => {
    await seedConfig({ mediaMtxUrl: 'http://mtx-host', mediaMtxApiPort: 8080 })
    server.use(
      http.get('http://mtx-host:8080/v3/config/global/get', () =>
        HttpResponse.json({ logLevel: 'debug', api: true })),
    )

    const got = await getGlobalConfig()
    expect(got).toEqual({ logLevel: 'debug', api: true })
  })

  it('returns undefined and swallows the error when MediaMTX is unreachable', async () => {
    await seedConfig()
    server.use(
      http.get('http://mediamtx:9997/v3/config/global/get', () => HttpResponse.error()),
    )
    expect(await getGlobalConfig()).toBeUndefined()
  })

  it('returns undefined when MediaMTX responds 5xx', async () => {
    await seedConfig()
    server.use(
      http.get('http://mediamtx:9997/v3/config/global/get', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 })),
    )
    expect(await getGlobalConfig()).toBeUndefined()
  })
})
