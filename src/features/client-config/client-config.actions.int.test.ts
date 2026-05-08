import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '@/lib/db'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}))

const { updateClientConfig } = await import('./client-config.actions')

beforeEach(async () => {
  revalidatePath.mockClear()
  await db.config.deleteMany()
})

afterAll(async () => {
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

describe('updateClientConfig', () => {
  it('persists the new values and returns true', async () => {
    const seeded = await seedConfig()

    const ok = await updateClientConfig({
      clientConfig: {
        ...seeded,
        mediaMtxUrl: 'http://changed',
        mediaMtxApiPort: 8080,
      },
    })

    expect(ok).toBe(true)
    const after = await db.config.findUniqueOrThrow({ where: { id: seeded.id } })
    expect(after.mediaMtxUrl).toBe('http://changed')
    expect(after.mediaMtxApiPort).toBe(8080)
  })

  it('revalidates the home path on success', async () => {
    const seeded = await seedConfig()
    await updateClientConfig({ clientConfig: seeded })
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns false when the row does not exist', async () => {
    const ok = await updateClientConfig({
      clientConfig: {
        id: 999,
        mediaMtxUrl: 'http://x',
        mediaMtxApiPort: 1,
        remoteMediaMtxUrl: null,
        recordingsDirectory: '/r',
        screenshotsDirectory: '/s',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    expect(ok).toBe(false)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
