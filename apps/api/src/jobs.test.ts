import type { ChildProcess } from 'node:child_process'
import cp from 'node:child_process'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { __resetCaptureSlots, captureLiveSnapshots, captureSnapshot, MAX_CONCURRENT_CAPTURES } from './jobs'
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

/** Drain the microtask queue so gated spawns run — fake timers don't touch it. */
async function flushMicrotasks() {
  for (let i = 0; i < 10; i++)
    await Promise.resolve()
}

describe('captureLiveSnapshots', () => {
  let proc: FakeProc

  beforeEach(() => {
    // Fake timers keep the job's real 15s kill timer from outliving the test run.
    vi.useFakeTimers()
    // The concurrency gate is module-level state shared across cases.
    __resetCaptureSlots()
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

  it('never runs more ffmpeg at once than the concurrency cap', async () => {
    const names = Array.from({ length: MAX_CONCURRENT_CAPTURES + 1 }, (_, i) => `s${i}`)
    mockMediaMtx(names.map(name => ({ name, ready: true })))

    await captureLiveSnapshots()

    // One more ready stream than the cap, so the last capture waits for a slot.
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    // Free a slot; the queued capture now spawns.
    proc.emit('close', 0)
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES + 1)
  })

  it('releases only one slot when a spawn both errors and closes', async () => {
    // A failed spawn (e.g. ffmpeg missing) fires both 'error' and 'close'. Each
    // capture needs its own emitter to target one; the shared beforeEach proc
    // would fan an emit out to every capture's handlers.
    const procs: FakeProc[] = []
    vi.mocked(cp.spawn).mockImplementation(() => {
      const p = fakeProc()
      procs.push(p)
      return p as unknown as ChildProcess
    })

    const names = Array.from({ length: MAX_CONCURRENT_CAPTURES }, (_, i) => `s${i}`)
    mockMediaMtx(names.map(name => ({ name, ready: true })))
    await captureLiveSnapshots()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    // Two on-demand captures queue behind the full gate.
    captureSnapshot('a').catch(() => {})
    captureSnapshot('b').catch(() => {})
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    // One active capture both errors and closes; a double release would free two
    // slots and spawn both queued captures.
    const [first] = procs
    if (!first)
      throw new Error('expected a spawned capture process')
    first.emit('error', new Error('ENOENT'))
    first.emit('close', null)
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES + 1)
  })

  it('counts on-demand captures against the same cap as the cron', async () => {
    // Saturate the gate with a full cron sweep, then a user-triggered capture
    // must wait rather than spawn a process on top of the cap.
    const names = Array.from({ length: MAX_CONCURRENT_CAPTURES }, (_, i) => `s${i}`)
    mockMediaMtx(names.map(name => ({ name, ready: true })))
    await captureLiveSnapshots()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    captureSnapshot('on-demand').catch(() => {})
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    proc.emit('close', 0)
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES + 1)
  })
})

describe('captureSnapshot on demand', () => {
  let proc: FakeProc

  beforeEach(() => {
    vi.useFakeTimers()
    __resetCaptureSlots()
    proc = fakeProc()
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    mockMediaMtx([])
    vi.spyOn(cp, 'spawn').mockReturnValue(proc as unknown as ChildProcess)
    vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined)
    vi.spyOn(fs, 'renameSync').mockReturnValue(undefined)
    vi.spyOn(fs, 'rmSync').mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('captures the named stream off its RTSP feed', async () => {
    captureSnapshot('parking-lot').catch(() => {})
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledOnce()
    expect(argvOf()).toContain('rtsp://127.0.0.1:8554/parking-lot')
  })

  it('resolves and renames the frame in once ffmpeg succeeds', async () => {
    const done = captureSnapshot('parking-lot')
    await flushMicrotasks()
    proc.emit('close', 0)

    await expect(done).resolves.toBeUndefined()
    expect(fs.renameSync).toHaveBeenCalledWith(
      '/shots/parking-lot/live.png.tmp',
      '/shots/parking-lot/live.png',
    )
  })

  it('rejects and keeps the old snapshot when ffmpeg fails', async () => {
    const done = captureSnapshot('parking-lot')
    await flushMicrotasks()
    proc.emit('close', 1)

    await expect(done).rejects.toThrow()
    expect(fs.renameSync).not.toHaveBeenCalled()
    expect(fs.rmSync).toHaveBeenCalledWith('/shots/parking-lot/live.png.tmp', { force: true })
  })
})
