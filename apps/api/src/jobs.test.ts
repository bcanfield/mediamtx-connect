import type { ChildProcess } from 'node:child_process'
import cp from 'node:child_process'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import {
  __resetSpawnGates,
  captureLiveSnapshots,
  captureSnapshot,
  cleanupScreenshots,
  generateScreenshots,
  MAX_CONCURRENT_CAPTURES,
  MAX_CONCURRENT_THUMBNAILS,
} from './jobs'
import { logger } from './logger'
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

// A fresh emitter per spawn, so a test can end one process. With the shared
// beforeEach proc an emit fans out to every capture's handlers.
function procPerSpawn(): FakeProc[] {
  const procs: FakeProc[] = []
  vi.mocked(cp.spawn).mockImplementation(() => {
    const p = fakeProc()
    procs.push(p)
    return p as unknown as ChildProcess
  })
  return procs
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
    // The concurrency gates are module-level state shared across cases.
    __resetSpawnGates()
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

    const tmp = argvOf().at(-1)
    expect(tmp).toMatch(/^\/shots\/stream1\/live\.png\..+\.tmp$/)
    expect(fs.renameSync).not.toHaveBeenCalled()

    proc.emit('close', 0)

    expect(fs.renameSync).toHaveBeenCalledWith(tmp, '/shots/stream1/live.png')
  })

  it('discards the tmp file and keeps the old snapshot when ffmpeg fails', async () => {
    await captureLiveSnapshots()
    proc.emit('close', 1)

    expect(fs.renameSync).not.toHaveBeenCalled()
    expect(fs.rmSync).toHaveBeenCalledWith(argvOf().at(-1), { force: true })
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
    const procs = procPerSpawn()
    const names = Array.from({ length: MAX_CONCURRENT_CAPTURES + 2 }, (_, i) => `s${i}`)
    mockMediaMtx(names.map(name => ({ name, ready: true })))

    await captureLiveSnapshots()

    // Two more ready streams than the cap, so the last two wait for a slot.
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    // Free one slot; exactly one queued capture spawns.
    procs[0]!.emit('close', 0)
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES + 1)
  })

  it('releases only one slot when a spawn both errors and closes', async () => {
    // A failed spawn (e.g. ffmpeg missing) fires both 'error' and 'close'.
    const procs = procPerSpawn()

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

  it('gives concurrent captures of one stream their own tmp file', async () => {
    // A manual "Take snapshot" can land while the cron is capturing the same
    // stream. Sharing a tmp file, the second rename finds nothing to move and
    // throws inside ffmpeg's 'close' listener, which crashes the API process.
    const procs: FakeProc[] = []
    vi.mocked(cp.spawn).mockImplementation(() => {
      const p = fakeProc()
      procs.push(p)
      return p as unknown as ChildProcess
    })
    const renamed = new Set<string>()
    vi.mocked(fs.renameSync).mockImplementation((from) => {
      if (renamed.has(String(from)))
        throw Object.assign(new Error(`ENOENT: no such file or directory, rename '${String(from)}'`), { code: 'ENOENT' })
      renamed.add(String(from))
    })

    await captureLiveSnapshots()
    const manual = captureSnapshot('stream1')
    await flushMicrotasks()
    const [cron, onDemand] = procs
    if (!cron || !onDemand)
      throw new Error('expected two spawned capture processes')

    cron.emit('close', 0)
    onDemand.emit('close', 0)

    await expect(manual).resolves.toBeUndefined()
    expect(argvOf(0).at(-1)).not.toBe(argvOf(1).at(-1))
  })

  it('counts on-demand captures against the same cap as the cron', async () => {
    // Saturate the gate with a full cron sweep, then user-triggered captures
    // must wait rather than spawn a process on top of the cap.
    const procs = procPerSpawn()
    const names = Array.from({ length: MAX_CONCURRENT_CAPTURES }, (_, i) => `s${i}`)
    mockMediaMtx(names.map(name => ({ name, ready: true })))
    await captureLiveSnapshots()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    captureSnapshot('a').catch(() => {})
    captureSnapshot('b').catch(() => {})
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES)

    procs[0]!.emit('close', 0)
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_CAPTURES + 1)
  })
})

describe('captureSnapshot on demand', () => {
  let proc: FakeProc

  beforeEach(() => {
    vi.useFakeTimers()
    __resetSpawnGates()
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
    expect(fs.renameSync).toHaveBeenCalledWith(argvOf().at(-1), '/shots/parking-lot/live.png')
  })

  it('rejects and keeps the old snapshot when ffmpeg fails', async () => {
    const done = captureSnapshot('parking-lot')
    await flushMicrotasks()
    proc.emit('close', 1)

    await expect(done).rejects.toThrow()
    expect(fs.renameSync).not.toHaveBeenCalled()
    expect(fs.rmSync).toHaveBeenCalledWith(argvOf().at(-1), { force: true })
  })
})

describe('generateScreenshots', () => {
  let proc: FakeProc

  /** One stream directory under /rec, with whichever thumbnails already exist. */
  function mockRecordingsTree(recordings: string[], screenshots: string[] = []) {
    const tree: Record<string, string[]> = {
      '/rec': ['cam1'],
      '/rec/cam1': recordings,
      '/shots/cam1': screenshots,
    }
    vi.spyOn(fs, 'readdirSync').mockImplementation(dir => (tree[String(dir)] ?? []) as never)
  }

  /** `count` recordings, none of them thumbnailed yet. */
  function backlogOf(count: number) {
    mockRecordingsTree(Array.from({ length: count }, (_, i) => `r${i}.mp4`))
  }

  beforeEach(() => {
    vi.useFakeTimers()
    __resetSpawnGates()
    proc = fakeProc()
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)
    mockMediaMtx([])
    vi.spyOn(cp, 'spawn').mockReturnValue(proc as unknown as ChildProcess)
    vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as never)
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined)
    mockRecordingsTree([])
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('extracts a first frame only for recordings without a thumbnail', async () => {
    mockRecordingsTree(['r0.mp4', 'r1.mp4'], ['r0.png'])

    generateScreenshots().catch(() => {})
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledOnce()
    expect(argvOf()).toEqual([
      '-ss',
      '00:00:00',
      '-i',
      '/rec/cam1/r1.mp4',
      '-frames:v',
      '1',
      '/shots/cam1/r1.png',
    ])
  })

  it('never runs more ffmpeg at once than the thumbnail cap', async () => {
    backlogOf(MAX_CONCURRENT_THUMBNAILS + 1)

    generateScreenshots().catch(() => {})
    await flushMicrotasks()

    // One more recording than the cap, so the last thumbnail waits for a slot.
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_THUMBNAILS)

    // Free a slot; the queued thumbnail now spawns.
    proc.emit('close', 0)
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_THUMBNAILS + 1)
  })

  it('releases only one slot when a spawn both errors and closes', async () => {
    // Each thumbnail needs its own emitter, or one emit fans out to every
    // spawn's handlers (same reason as the capture case above).
    const procs: FakeProc[] = []
    vi.mocked(cp.spawn).mockImplementation(() => {
      const p = fakeProc()
      procs.push(p)
      return p as unknown as ChildProcess
    })
    backlogOf(MAX_CONCURRENT_THUMBNAILS + 2)

    generateScreenshots().catch(() => {})
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_THUMBNAILS)

    // A failed spawn (e.g. ffmpeg missing) fires both; a double release would
    // free two slots and spawn both queued thumbnails.
    const first = procs[0] as FakeProc
    first.emit('error', new Error('ENOENT'))
    first.emit('close', null)
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_THUMBNAILS + 1)
  })

  it('does not queue a live capture behind a thumbnail backlog', async () => {
    // Sibling gates, not a shared one: the recordings sweep is batch work, and
    // making a user-triggered snapshot wait behind it would be a regression.
    backlogOf(MAX_CONCURRENT_THUMBNAILS + 1)

    generateScreenshots().catch(() => {})
    await flushMicrotasks()
    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_THUMBNAILS)

    captureSnapshot('parking-lot').catch(() => {})
    await flushMicrotasks()

    expect(cp.spawn).toHaveBeenCalledTimes(MAX_CONCURRENT_THUMBNAILS + 1)
    expect(argvOf(MAX_CONCURRENT_THUMBNAILS)).toContain('rtsp://127.0.0.1:8554/parking-lot')
  })
})

// The cases below run against a real temp tree rather than the fs spies above:
// they are about which files exist on disk, and a mocked readdir would only
// assert the mock.
describe('on a real recordings tree', () => {
  let root: string
  let recordings: string
  let screenshots: string

  /** Create `dir/name` (and its parents), last modified `ageMs` ago. */
  function touch(dir: string, name: string, ageMs = 0) {
    fs.mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, name)
    fs.writeFileSync(filePath, '')
    const when = new Date(Date.now() - ageMs)
    fs.utimesSync(filePath, when, when)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    __resetSpawnGates()
    root = fs.mkdtempSync(path.join(tmpdir(), 'jobs-'))
    recordings = path.join(root, 'recordings')
    screenshots = path.join(root, 'screenshots')
    fs.mkdirSync(recordings)
    fs.mkdirSync(screenshots)
    vi.mocked(getAppConfig).mockResolvedValue({
      ...CONFIG,
      recordingsDirectory: recordings,
      screenshotsDirectory: screenshots,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fs.rmSync(root, { recursive: true, force: true })
  })

  describe('cleanupScreenshots', () => {
    const HOUR = 60 * 60 * 1000
    const THREE_DAYS = 3 * 24 * HOUR

    it('keeps thumbnails whose segment still exists and prunes everything else past 2 days', async () => {
      touch(path.join(recordings, 's1'), 'old.mp4')
      touch(path.join(recordings, 's1'), 'old-ts.ts')
      const shots = path.join(screenshots, 's1')
      touch(shots, 'old.png', THREE_DAYS)
      touch(shots, 'old-ts.png', THREE_DAYS)
      touch(shots, 'gone.png', THREE_DAYS)
      touch(shots, 'fresh.png', HOUR)
      touch(shots, 'live.png', THREE_DAYS)

      await cleanupScreenshots()

      expect(fs.readdirSync(shots).sort()).toEqual(['fresh.png', 'old-ts.png', 'old.png'])
    })

    // Only a PNG is a thumbnail; anything else sharing a segment's stem is litter.
    it('prunes an old non-PNG file even when it shares a segment\'s stem', async () => {
      touch(path.join(recordings, 's1'), 'old.mp4')
      const shots = path.join(screenshots, 's1')
      touch(shots, 'old.txt', THREE_DAYS)

      await cleanupScreenshots()

      expect(fs.readdirSync(shots)).toEqual([])
    })

    // A stream can have live captures without ever recording.
    it('prunes a stream that has no recordings directory', async () => {
      const shots = path.join(screenshots, 'never-recorded')
      touch(shots, 'live.png', THREE_DAYS)

      await cleanupScreenshots()

      expect(fs.readdirSync(shots)).toEqual([])
    })
  })

  // A fake ffmpeg that exits with `code` on its own, so a job that spawns one
  // it shouldn't still settles and fails on the assertion, not a timeout.
  function ffmpegExits(code: number) {
    vi.spyOn(cp, 'spawn').mockImplementation(() => {
      const p = fakeProc()
      void Promise.resolve().then(() => p.emit('close', code))
      return p as unknown as ChildProcess
    })
  }

  describe('generateScreenshots', () => {
    it('thumbnails an MPEG-TS segment from its real file', async () => {
      ffmpegExits(0)
      touch(path.join(recordings, 's1'), 'a.ts')

      await generateScreenshots()

      expect(cp.spawn).toHaveBeenCalledOnce()
      const argv = argvOf()
      expect(argv[argv.indexOf('-i') + 1]).toBe(path.join(recordings, 's1', 'a.ts'))
      expect(argv.at(-1)).toBe(path.join(screenshots, 's1', 'a.png'))
    })

    it('leaves a segment alone once its thumbnail exists', async () => {
      ffmpegExits(0)
      touch(path.join(recordings, 's1'), 'a.ts')
      touch(path.join(screenshots, 's1'), 'a.png')

      await generateScreenshots()

      expect(cp.spawn).not.toHaveBeenCalled()
    })

    it('ignores files that are not recording segments', async () => {
      ffmpegExits(0)
      touch(path.join(recordings, 's1'), 'notes.txt')
      // MediaMTX writes the segment it is still recording under a leading dot.
      touch(path.join(recordings, 's1'), '.partial.mp4')

      await generateScreenshots()

      expect(cp.spawn).not.toHaveBeenCalled()
    })

    it('logs a failed ffmpeg exit as a failure, naming the thumbnail', async () => {
      ffmpegExits(1)
      touch(path.join(recordings, 's1'), 'a.mp4')

      await generateScreenshots()

      const output = path.join(screenshots, 's1', 'a.png')
      const failures = [...vi.mocked(logger.warn).mock.calls, ...vi.mocked(logger.error).mock.calls]
      expect(failures.flat().some(arg => typeof arg === 'string' && arg.includes(output))).toBe(true)
      expect(vi.mocked(logger.info).mock.calls.flat()).not.toContainEqual(expect.stringContaining('Finished generating screenshot'))
    })
  })

  describe('captureSnapshot', () => {
    let configGlobalGet: ReturnType<typeof vi.fn>

    beforeEach(() => {
      vi.useFakeTimers()
      configGlobalGet = vi.fn().mockResolvedValue({ rtspAddress: ':8554' })
      vi.mocked(mediaMtxApi).mockReturnValue({ configGlobalGet } as never)
      // No frame was really written, so a 0 exit would fail the rename.
      ffmpegExits(1)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('rejects a name that climbs out of the screenshots directory before touching anything', async () => {
      await expect(captureSnapshot('../escaped')).rejects.toThrow('No stream named ../escaped')

      expect(fs.existsSync(path.join(root, 'escaped'))).toBe(false)
      expect(configGlobalGet).not.toHaveBeenCalled()
      expect(cp.spawn).not.toHaveBeenCalled()
    })

    it('still captures a nested MediaMTX path', async () => {
      await captureSnapshot('cam/front').catch(() => {})

      expect(cp.spawn).toHaveBeenCalledOnce()
      expect(argvOf()).toContain('rtsp://127.0.0.1:8554/cam/front')
    })
  })
})
