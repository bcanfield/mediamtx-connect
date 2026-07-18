import cp from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import cron from 'node-cron'
import { getAppConfig } from './config-store'
import { logger } from './logger'
import { mediaMtxApi } from './mediamtx'

function getSubdirectories(dirPath: string): string[] {
  const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'))
  return files.filter(file => fs.statSync(path.join(dirPath, file)).isDirectory())
}

function getFileNamesWithoutExtension(directoryPath: string): string[] {
  return fs
    .readdirSync(directoryPath)
    .filter(f => !f.startsWith('.'))
    .map(file => path.parse(file).name)
}

// Scan the recordings tree for MP4s without a sibling PNG and spawn ffmpeg to
// grab a first-frame thumbnail. Non-blocking, parallel.
async function generateScreenshots() {
  logger.info('Scanning new recordings to generate new screenshots')
  const config = await getAppConfig()
  const streamRecordingDirectories = getSubdirectories(config.recordingsDirectory)

  for (const subdirectory of streamRecordingDirectories) {
    const streamScreenshotDirectory = path.join(config.screenshotsDirectory, subdirectory)
    if (!fs.existsSync(streamScreenshotDirectory)) {
      fs.mkdirSync(streamScreenshotDirectory, { recursive: true })
      logger.info('Screenshots directory created successfully.')
    }

    const recordings = getFileNamesWithoutExtension(path.join(config.recordingsDirectory, subdirectory))
    const screenshots = getFileNamesWithoutExtension(streamScreenshotDirectory)
    const missing = recordings.filter(file => !screenshots.includes(file))

    logger.info(`${missing.length} recordings without screenshots in: ${subdirectory}`)

    for (const recording of missing) {
      const inputFile = path.join(config.recordingsDirectory, subdirectory, `${recording}.mp4`)
      const outputFile = path.join(streamScreenshotDirectory, `${recording}.png`)
      const proc = cp.spawn('ffmpeg', ['-ss', '00:00:00', '-i', inputFile, '-frames:v', '1', outputFile])
      proc.on('error', (err) => {
        logger.error({ err }, `Failed to spawn ffmpeg for ${outputFile}`)
      })
      proc.on('close', () => {
        logger.info(`Finished generating screenshot ${outputFile}`)
      })
    }
  }
}

// A shared permit gate over ffmpeg snapshot captures. Both the 30s cron and the
// on-demand mutation acquire here, so the cap counts them together: the cron
// already spawns one process per ready stream with no cap, and a user-triggered
// capture stacks on top of that (ticket 08). A bound covering only one source
// would not bound the server.
export const MAX_CONCURRENT_CAPTURES = 4

let activeCaptures = 0
const captureWaiters: Array<() => void> = []

function acquireCaptureSlot(): Promise<void> {
  if (activeCaptures < MAX_CONCURRENT_CAPTURES) {
    activeCaptures++
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    captureWaiters.push(resolve)
  })
}

function releaseCaptureSlot() {
  // Hand the permit straight to the next waiter rather than decrement then
  // re-increment, so the count never dips and lets an extra capture in.
  const next = captureWaiters.shift()
  if (next) {
    next()
    return
  }
  activeCaptures--
}

// Test-only: the gate is module-level shared state, so a suite that spawns
// without driving each capture to close must reset it between cases.
export function __resetCaptureSlots() {
  activeCaptures = 0
  captureWaiters.length = 0
}

function rtspUrlFor(mediaMtxUrl: string, rtspAddress: string | undefined, streamName: string): string {
  const host = new URL(mediaMtxUrl).hostname
  const rtspPort = (rtspAddress ?? ':8554').split(':').pop()
  return `rtsp://${host}:${rtspPort}/${streamName}`
}

// Grab one frame off a stream's RTSP feed and keep it as live.png. MediaMTX has
// no snapshot endpoint, so we pull the frame from the RTSP feed it already
// serves. Written via tmp+rename so /latest never serves a half-written file.
// Acquires a shared permit first and releases it when ffmpeg exits, so no caller
// exceeds the concurrency cap. Resolves on success, rejects on failure.
async function captureFrame(streamName: string, rtspUrl: string, screenshotsDirectory: string): Promise<void> {
  await acquireCaptureSlot()

  const dir = path.join(screenshotsDirectory, streamName)
  fs.mkdirSync(dir, { recursive: true })
  const outputFile = path.join(dir, 'live.png')
  const tmp = `${outputFile}.tmp`

  return new Promise((resolve, reject) => {
    // -c:v/-f are explicit because the tmp name has no .png for ffmpeg to sniff.
    const proc = cp.spawn('ffmpeg', [
      '-y',
      '-rtsp_transport',
      'tcp',
      '-i',
      rtspUrl,
      '-frames:v',
      '1',
      '-update',
      '1',
      '-c:v',
      'png',
      '-f',
      'image2',
      tmp,
    ])

    // A camera that accepts the connection then stalls would pile up a new
    // ffmpeg every tick, so cap each capture well under the 30s interval.
    const killTimer = setTimeout(() => proc.kill('SIGKILL'), 15_000)

    // A failed spawn fires both 'error' and 'close', so release the permit and
    // settle exactly once — a double release would over-count the gate and let
    // an extra ffmpeg past the cap.
    let settled = false
    const finish = (done: () => void) => {
      if (settled)
        return
      settled = true
      clearTimeout(killTimer)
      releaseCaptureSlot()
      done()
    }

    proc.on('error', (err) => {
      logger.error({ err }, `Failed to spawn ffmpeg for ${outputFile}`)
      finish(() => reject(err))
    })
    proc.on('close', (code) => {
      finish(() => {
        if (code === 0) {
          fs.renameSync(tmp, outputFile)
          resolve()
          return
        }
        fs.rmSync(tmp, { force: true })
        logger.warn(`ffmpeg exited ${code} capturing snapshot for ${streamName}`)
        reject(new Error(`ffmpeg exited ${code} capturing snapshot for ${streamName}`))
      })
    })
  })
}

// The 30s cron: capture every ready stream. Fire-and-forget per stream — the
// shared gate caps how many ffmpeg run at once, and captureFrame logs its own
// failures, so a rejected capture here is nothing to act on.
export async function captureLiveSnapshots() {
  const config = await getAppConfig()
  const api = mediaMtxApi(config)
  const [paths, globalConf] = await Promise.all([api.pathsList(), api.configGlobalGet()])

  const liveStreams = (paths.items ?? [])
    .filter(p => p.ready)
    .map(p => p.name)
    .filter(name => name !== undefined)

  logger.info(`Capturing snapshots for ${liveStreams.length} live streams`)

  for (const streamName of liveStreams) {
    captureFrame(
      streamName,
      rtspUrlFor(config.mediaMtxUrl, globalConf.rtspAddress, streamName),
      config.screenshotsDirectory,
    ).catch(() => {})
  }
}

// On-demand capture of one stream, exposed as a mutation. Shares the cron's gate
// so a user-triggered capture cannot overload a server already mid-sweep. Awaits
// the ffmpeg exit and rejects on failure so the caller can report the outcome.
export async function captureSnapshot(streamName: string): Promise<void> {
  const config = await getAppConfig()
  const globalConf = await mediaMtxApi(config).configGlobalGet()
  await captureFrame(
    streamName,
    rtspUrlFor(config.mediaMtxUrl, globalConf.rtspAddress, streamName),
    config.screenshotsDirectory,
  )
}

// Deletes screenshots older than 2 days, per stream subdirectory.
async function cleanupScreenshots() {
  logger.info('Cleaning up screenshots')
  const config = await getAppConfig()
  const streamDirectories = getSubdirectories(config.screenshotsDirectory)
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000

  for (const subdirectory of streamDirectories) {
    const dir = path.join(config.screenshotsDirectory, subdirectory)
    for (const file of fs.readdirSync(dir).filter(f => !f.startsWith('.'))) {
      const filePath = path.join(dir, file)
      const fileStat = fs.statSync(filePath)
      if (fileStat.isFile() && fileStat.mtimeMs < twoDaysAgo) {
        fs.unlinkSync(filePath)
        logger.info(`Deleted screenshot: ${filePath}`)
      }
    }
  }
}

export function startJobs() {
  captureLiveSnapshots().catch((error) => {
    logger.error({ err: error }, 'Unable to run captureLiveSnapshots')
  })
  cron.schedule('*/30 * * * * *', () => {
    captureLiveSnapshots().catch((error) => {
      logger.error({ err: error }, 'Unable to run captureLiveSnapshots')
    })
  })

  generateScreenshots().catch((error) => {
    logger.error({ err: error }, 'Unable to run generateScreenshots')
  })
  cron.schedule('*/30 * * * *', () => {
    generateScreenshots().catch((error) => {
      logger.error({ err: error }, 'Unable to run generateScreenshots')
    })
  })

  cleanupScreenshots().catch((error) => {
    logger.error({ err: error }, 'Unable to run cleanupScreenshots')
  })
  cron.schedule('0 0 0 * * *', () => {
    cleanupScreenshots().catch((error) => {
      logger.error({ err: error }, 'Unable to run cleanupScreenshots')
    })
  })
}
