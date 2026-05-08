import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/lib/db'

import { getAppConfig } from './client-config.queries'

beforeEach(async () => {
  await db.config.deleteMany()
})

afterAll(async () => {
  await db.$disconnect()
})

describe('getAppConfig', () => {
  it('returns null when no Config row exists', async () => {
    expect(await getAppConfig()).toBeNull()
  })

  it('returns the singleton Config row when one exists', async () => {
    const created = await db.config.create({
      data: {
        mediaMtxUrl: 'http://mediamtx',
        mediaMtxApiPort: 9997,
        recordingsDirectory: '/recordings',
        screenshotsDirectory: '/screenshots',
      },
    })

    const got = await getAppConfig()
    expect(got?.id).toBe(created.id)
    expect(got?.mediaMtxUrl).toBe('http://mediamtx')
  })
})
