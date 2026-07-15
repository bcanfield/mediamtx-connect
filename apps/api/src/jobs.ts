import cp from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import cron from 'node-cron'
import { getAppConfig } from './config-store'
import { logger } from './logger'

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
