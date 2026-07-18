import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bootstrapConfig, updateAppConfig } from './config-store'
import { logger } from './logger'

// env.ts validates process.env at import time, so it can never load for real here.
// hoisted so the vi.mock factory below can reference these before they'd normally exist.
const { mockEnv, mockRawEnv } = vi.hoisted(() => ({
  mockEnv: {
    DATA_DIR: '/data',
    BACKEND_SERVER_MEDIAMTX_URL: 'http://mediamtx',
    MEDIAMTX_API_PORT: '9997',
    REMOTE_MEDIAMTX_URL: 'http://localhost',
    MEDIAMTX_RECORDINGS_DIR: '/recordings',
    MEDIAMTX_SCREENSHOTS_DIR: '/screenshots',
  },
  mockRawEnv: {} as Record<string, string | undefined>,
}))

vi.mock('./env', () => ({ env: mockEnv, rawEnv: mockRawEnv }))
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('node:fs', async importActual => ({
  ...await importActual<typeof import('node:fs')>(),
  existsSync: vi.fn(),
}))
vi.mock('node:fs/promises', async importActual => ({
  ...await importActual<typeof import('node:fs/promises')>(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
  rename: vi.fn(),
  writeFile: vi.fn(),
}))

const STORED = {
  mediaMtxUrl: 'http://mediamtx',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/recordings',
  screenshotsDirectory: '/screenshots',
}

/** Pretend config.json exists and holds `stored`. */
function storedConfig(stored: Record<string, unknown> = STORED) {
  vi.mocked(existsSync).mockReturnValue(true)
  vi.mocked(readFile).mockResolvedValue(JSON.stringify(stored))
}

function driftWarning() {
  return vi.mocked(logger.warn).mock.calls[0]?.[0] as { drift: Array<{ var: string }> } | undefined
}

/** When a mock first ran, for asserting call order. Throws if it never ran. */
function firstCallOrder(mock: { mock: { invocationCallOrder: number[] } }): number {
  const [order] = mock.mock.invocationCallOrder
  if (order === undefined)
    throw new Error('expected the mock to have been called, but it never was')
  return order
}

beforeEach(() => {
  Object.assign(mockEnv, {
    DATA_DIR: '/data',
    BACKEND_SERVER_MEDIAMTX_URL: 'http://mediamtx',
    MEDIAMTX_API_PORT: '9997',
    REMOTE_MEDIAMTX_URL: 'http://localhost',
    MEDIAMTX_RECORDINGS_DIR: '/recordings',
    MEDIAMTX_SCREENSHOTS_DIR: '/screenshots',
  })
  for (const k of Object.keys(mockRawEnv)) delete mockRawEnv[k]
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('updateAppConfig', () => {
  it('writes through a tmp file so a crash cannot leave a torn config.json', async () => {
    await updateAppConfig(STORED)

    expect(writeFile).toHaveBeenCalledWith('/data/config.json.tmp', expect.any(String))
    expect(rename).toHaveBeenCalledWith('/data/config.json.tmp', '/data/config.json')
    // The rename is what makes it atomic — it must come after the write.
    expect(firstCallOrder(vi.mocked(writeFile))).toBeLessThan(firstCallOrder(vi.mocked(rename)))
  })

  it('creates the data directory before writing into it', async () => {
    await updateAppConfig(STORED)

    expect(mkdir).toHaveBeenCalledWith('/data', { recursive: true })
    expect(firstCallOrder(vi.mocked(mkdir))).toBeLessThan(firstCallOrder(vi.mocked(writeFile)))
  })

  it('rejects an invalid config without touching the file', async () => {
    await expect(updateAppConfig({ ...STORED, mediaMtxApiPort: 0 })).rejects.toThrow()

    expect(writeFile).not.toHaveBeenCalled()
    expect(rename).not.toHaveBeenCalled()
  })
})

describe('bootstrapConfig', () => {
  it('seeds config.json from env on first boot', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const config = await bootstrapConfig()

    expect(config.mediaMtxUrl).toBe('http://mediamtx')
    expect(config.mediaMtxApiPort).toBe(9997)
    expect(rename).toHaveBeenCalledWith('/data/config.json.tmp', '/data/config.json')
  })

  it('leaves an existing config.json alone even when env disagrees', async () => {
    storedConfig({ ...STORED, mediaMtxUrl: 'http://ui-set-this' })
    mockRawEnv.BACKEND_SERVER_MEDIAMTX_URL = 'http://mediamtx'

    const config = await bootstrapConfig()

    expect(config.mediaMtxUrl).toBe('http://ui-set-this')
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('warns about env vars the operator set that disagree with the stored config', async () => {
    storedConfig({ ...STORED, recordingsDirectory: '../../test-data/recordings' })
    mockRawEnv.MEDIAMTX_RECORDINGS_DIR = '/recordings'

    await bootstrapConfig()

    expect(logger.warn).toHaveBeenCalledOnce()
    expect(driftWarning()?.drift.map(d => d.var)).toEqual(['MEDIAMTX_RECORDINGS_DIR'])
  })

  it('stays quiet when a differing value is only a schema default, not an override', async () => {
    // Same disagreement as above, but the operator never set the var — the value
    // came from env.ts's default, which is absence of an override, not drift.
    storedConfig({ ...STORED, recordingsDirectory: '../../test-data/recordings' })

    await bootstrapConfig()

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('stays quiet when a set env var agrees with the stored config', async () => {
    storedConfig()
    mockRawEnv.MEDIAMTX_RECORDINGS_DIR = '/recordings'

    await bootstrapConfig()

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('ensures the recordings and screenshots directories exist', async () => {
    storedConfig()

    await bootstrapConfig()

    expect(mkdir).toHaveBeenCalledWith('/recordings', { recursive: true })
    expect(mkdir).toHaveBeenCalledWith('/screenshots', { recursive: true })
  })
})
