import type { ChildProcess } from 'node:child_process'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cronSchedule = vi.fn()
const cpSpawn = vi.fn<(cmd: string, args: string[]) => ChildProcess>()
const dbConfigFindFirst = vi.fn()
const dbConfigCreate = vi.fn()

vi.mock('node-cron', () => ({ default: { schedule: cronSchedule } }))
vi.mock('node:child_process', () => ({
  default: { spawn: (cmd: string, args: string[]) => cpSpawn(cmd, args) },
}))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/db', () => ({
  db: { config: { findFirst: dbConfigFindFirst, create: dbConfigCreate } },
}))

let tmp: string
let recordings: string
let screenshots: string

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'instrumentation-test-'))
  recordings = path.join(tmp, 'recordings')
  screenshots = path.join(tmp, 'screenshots')
  fs.mkdirSync(recordings)
  fs.mkdirSync(screenshots)

  vi.stubEnv('NEXT_RUNTIME', 'nodejs')
  vi.stubEnv('BACKEND_SERVER_MEDIAMTX_URL', 'http://mediamtx')
  vi.stubEnv('MEDIAMTX_API_PORT', '9997')
  vi.stubEnv('REMOTE_MEDIAMTX_URL', 'http://localhost')
  vi.stubEnv('MEDIAMTX_RECORDINGS_DIR', recordings)
  vi.stubEnv('MEDIAMTX_SCREENSHOTS_DIR', screenshots)

  cronSchedule.mockReset()
  cpSpawn.mockReset()
  cpSpawn.mockImplementation(() => {
    const stderr = { setEncoding: vi.fn() }
    const proc = { stderr, on: vi.fn() } as unknown as ChildProcess
    return proc
  })
  dbConfigFindFirst.mockReset()
  dbConfigCreate.mockReset()
  vi.resetModules()
})

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

async function importRegister() {
  const mod = await import('./instrumentation')
  return mod.register
}

function makeFile(p: string, mtime?: Date) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, '')
  if (mtime) {
    fs.utimesSync(p, mtime, mtime)
  }
}

describe('instrumentation.register', () => {
  it('creates a Config row from env when none exists', async () => {
    dbConfigFindFirst.mockResolvedValue(null)
    dbConfigCreate.mockResolvedValue({
      id: 1,
      mediaMtxUrl: 'http://mediamtx',
      mediaMtxApiPort: 9997,
      remoteMediaMtxUrl: 'http://localhost',
      recordingsDirectory: recordings,
      screenshotsDirectory: screenshots,
    })

    await (await importRegister())()

    expect(dbConfigCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        mediaMtxUrl: 'http://mediamtx',
        mediaMtxApiPort: 9997,
        recordingsDirectory: recordings,
        screenshotsDirectory: screenshots,
      }),
    })
  })

  it('does not create a Config row when one already exists', async () => {
    dbConfigFindFirst.mockResolvedValue({
      id: 1,
      recordingsDirectory: recordings,
      screenshotsDirectory: screenshots,
    })

    await (await importRegister())()

    expect(dbConfigCreate).not.toHaveBeenCalled()
  })

  it('schedules the screenshot job every 30 minutes and cleanup nightly', async () => {
    dbConfigFindFirst.mockResolvedValue({
      id: 1,
      recordingsDirectory: recordings,
      screenshotsDirectory: screenshots,
    })

    await (await importRegister())()

    const expressions = cronSchedule.mock.calls.map(c => c[0])
    expect(expressions).toContain('*/30 * * * *')
    expect(expressions).toContain('0 0 0 * * *')
  })

  it('spawns ffmpeg only for mp4s without a sibling png', async () => {
    dbConfigFindFirst.mockResolvedValue({
      id: 1,
      recordingsDirectory: recordings,
      screenshotsDirectory: screenshots,
    })

    makeFile(path.join(recordings, 'camera1', 'a.mp4'))
    makeFile(path.join(recordings, 'camera1', 'b.mp4'))
    makeFile(path.join(screenshots, 'camera1', 'a.png'))

    await (await importRegister())()

    expect(cpSpawn).toHaveBeenCalledTimes(1)
    const [cmd, args] = cpSpawn.mock.calls[0]!
    expect(cmd).toBe('ffmpeg')
    expect(args).toEqual([
      '-ss',
      '00:00:00',
      '-i',
      path.join(recordings, 'camera1', 'b.mp4'),
      '-frames:v',
      '1',
      path.join(screenshots, 'camera1', 'b.png'),
    ])
  })

  it('cleans up screenshots older than 2 days, keeps fresh ones', async () => {
    dbConfigFindFirst.mockResolvedValue({
      id: 1,
      recordingsDirectory: recordings,
      screenshotsDirectory: screenshots,
    })

    const fresh = path.join(screenshots, 'camera1', 'fresh.png')
    const stale = path.join(screenshots, 'camera1', 'stale.png')
    makeFile(fresh)
    makeFile(stale, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))

    await (await importRegister())()

    expect(fs.existsSync(fresh)).toBe(true)
    expect(fs.existsSync(stale)).toBe(false)
  })

  it('is a no-op outside the nodejs runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge')
    await (await importRegister())()
    expect(cronSchedule).not.toHaveBeenCalled()
    expect(dbConfigFindFirst).not.toHaveBeenCalled()
  })
})
