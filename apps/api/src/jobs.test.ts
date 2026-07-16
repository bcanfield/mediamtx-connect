import type { ChildProcess } from 'node:child_process'
import cp from 'node:child_process'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { captureLiveSnapshots } from './jobs'
import { mediaMtxApi } from './mediamtx'

// Factories (not automock) so the real modules never load — config-store pulls in
// env.ts, which validates process.env at import time.
vi.mock('./config-store', () => ({ getAppConfig: vi.fn() }))
vi.mock('./mediamtx', () => ({ mediaMtxApi: vi.fn() }))
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/rec',
  screenshotsDirectory: '/shots',
}

type FakeProc = EventEmitter & Pick<ChildProcess, 'kill'>

function fakeProc(): FakeProc {
  const proc = new EventEmitter() as FakeProc
  proc.kill = vi.fn()
  return proc
}

function mockMediaMtx(
  items: Array<{ name?: string, ready?: boolean }>,
  globalConf: { rtspAddress?: string } = { rtspAddress: ':8554' },
) {
  vi.mocked(mediaMtxApi).mockReturnValue({
    pathsList: vi.fn().mockResolvedValue({ items }),
    configGlobalGet: vi.fn().mockResolvedValue(globalConf),
    configGlobalPatch: vi.fn(),
  } as never)
}

/** The ffmpeg argv of the nth spawn call, or [] if it never happened. */
function argvOf(nth = 0): string[] {
  const [, argv] = vi.mocked(cp.spawn).mock.calls[nth] ?? []
  return (argv ?? []) as string[]
}

describe('captureLiveSnapshots', () => {
  let proc: FakeProc

  beforeEach(() => {
    // Fake timers keep the job's real 15s kill timer from outliving the test run.
    vi.useFakeTimers()
    proc = fakeProc()
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    mockMediaMtx([{ name: 'stream1', ready: true }])
    vi.spyOn(cp, 'spawn').mockReturnValue(proc as unknown as ChildProcess)
    vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined)
    vi.spyOn(fs, 'renameSync').mockReturnValue(undefined)
    vi.spyOn(fs, 'rmSync').mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('captures ready streams and skips the rest', async () => {
    mockMediaMtx([
      { name: 'live', ready: true },
      { name: 'idle', ready: false },
    ])

    await captureLiveSnapshots()

    expect(cp.spawn).toHaveBeenCalledOnce()
    expect(argvOf()).toContain('rtsp://127.0.0.1:8554/live')
  })

  it('skips paths MediaMTX reports without a name', async () => {
    mockMediaMtx([{ ready: true }])

    await captureLiveSnapshots()

    expect(cp.spawn).not.toHaveBeenCalled()
  })

  it('builds the RTSP url from the configured host and rtspAddress port', async () => {
    mockMediaMtx([{ name: 'stream1', ready: true }], { rtspAddress: '0.0.0.0:9554' })

    await captureLiveSnapshots()

    expect(argvOf()).toContain('rtsp://127.0.0.1:9554/stream1')
  })

  it('falls back to port 8554 when MediaMTX reports no rtspAddress', async () => {
    mockMediaMtx([{ name: 'stream1', ready: true }], {})

    await captureLiveSnapshots()

    expect(argvOf()).toContain('rtsp://127.0.0.1:8554/stream1')
  })

  it('writes to a tmp file, then renames it in once ffmpeg succeeds', async () => {
    await captureLiveSnapshots()

    expect(argvOf().at(-1)).toBe('/shots/stream1/live.png.tmp')
    expect(fs.renameSync).not.toHaveBeenCalled()

    proc.emit('close', 0)

    expect(fs.renameSync).toHaveBeenCalledWith(
      '/shots/stream1/live.png.tmp',
      '/shots/stream1/live.png',
    )
  })

  it('discards the tmp file and keeps the old snapshot when ffmpeg fails', async () => {
    await captureLiveSnapshots()
    proc.emit('close', 1)

    expect(fs.renameSync).not.toHaveBeenCalled()
    expect(fs.rmSync).toHaveBeenCalledWith('/shots/stream1/live.png.tmp', { force: true })
  })

  it('kills an ffmpeg that stalls past 15s', async () => {
    await captureLiveSnapshots()

    vi.advanceTimersByTime(14_999)
    expect(proc.kill).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(proc.kill).toHaveBeenCalledWith('SIGKILL')
  })

  it('does not kill an ffmpeg that already exited', async () => {
    await captureLiveSnapshots()
    proc.emit('close', 0)

    vi.advanceTimersByTime(60_000)

    expect(proc.kill).not.toHaveBeenCalled()
  })
})
