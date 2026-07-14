import cp from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import cron from 'node-cron'
import { db } from '@/lib/db'
import { env, rawEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

export async function register() {
  logger.info('Starting background tasks', { NODE_ENV: env.NODE_ENV })

  // Seed the singleton Config from env on first boot. After that, the /config UI
  // owns these values — re-setting env vars won't override an existing row.
  let config = await db.config.findFirst()
  if (!config) {
    config = await db.config.create({
      data: {
        mediaMtxUrl: env.BACKEND_SERVER_MEDIAMTX_URL,
        mediaMtxApiPort: Number.parseInt(env.MEDIAMTX_API_PORT, 10),
        remoteMediaMtxUrl: env.REMOTE_MEDIAMTX_URL,
        recordingsDirectory: env.MEDIAMTX_RECORDINGS_DIR,
        screenshotsDirectory: env.MEDIAMTX_SCREENSHOTS_DIR,
      },
    })
    logger.info('Seeded Config from env', { config: config as Record<string, unknown> })
  }
  else {
    // Only flag vars the operator explicitly set in the environment — schema
    // defaults aren't drift, they're just the absence of a runtime override.
    const candidates: Array<{ var: keyof typeof rawEnv, env: string, db: string }> = [
      { var: 'BACKEND_SERVER_MEDIAMTX_URL', env: env.BACKEND_SERVER_MEDIAMTX_URL, db: config.mediaMtxUrl },
      { var: 'MEDIAMTX_API_PORT', env: env.MEDIAMTX_API_PORT, db: String(config.mediaMtxApiPort) },
      { var: 'REMOTE_MEDIAMTX_URL', env: env.REMOTE_MEDIAMTX_URL, db: config.remoteMediaMtxUrl ?? '' },
      { var: 'MEDIAMTX_RECORDINGS_DIR', env: env.MEDIAMTX_RECORDINGS_DIR, db: config.recordingsDirectory },
      { var: 'MEDIAMTX_SCREENSHOTS_DIR', env: env.MEDIAMTX_SCREENSHOTS_DIR, db: config.screenshotsDirectory },
    ]
    const drift = candidates
      .filter(c => rawEnv[c.var] !== undefined && c.env !== c.db)
      .map(({ var: v, env: e, db: d }) => ({ var: v, env: e, db: d }))

    if (drift.length > 0) {
      logger.warn(
        'Env values differ from stored Config. Env vars only seed the first boot — the /config UI is authoritative afterwards. To apply env values, reset the database or update Config in the UI.',
        { drift },
      )
    }
  }

  logger.debug('Using config', { config: config as Record<string, unknown> })
  const recordingsDirectory = config.recordingsDirectory
  const screenshotsDirectory = config.screenshotsDirectory

  const createDirectoryIfNotExists = async (
    directoryPath: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.access(directoryPath, fs.constants.F_OK, (err) => {
        if (err) {
          // Directory doesn't exist, creating it
          fs.mkdir(directoryPath, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
              reject(mkdirErr)
            }
            else {
              logger.info(`Directory "${directoryPath}" created.`)
              resolve()
            }
          })
        }
        else {
          // Directory already exists
          logger.debug(`Directory "${directoryPath}" already exists.`)
          resolve()
        }
      })
    })
  }

  await createDirectoryIfNotExists(screenshotsDirectory)
  await createDirectoryIfNotExists(recordingsDirectory)

  const getSubdirectories = (dirPath: string) => {
    try {
      const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'))
      const subdirectories = files.filter((file) => {
        const filePath = path.join(dirPath, file)
        return fs.statSync(filePath).isDirectory()
      })
      return subdirectories
    }
    catch (err) {
      throw new Error(`Error reading directory: ${err}`)
    }
  }

  const getFileNamesWithoutExtension = (directoryPath: string) => {
    try {
      const files = fs
        .readdirSync(directoryPath)
        .filter(f => !f.startsWith('.'))
      return files.map(file => path.parse(file).name)
    }
    catch (err) {
      throw new Error(`Error reading directory: ${err}`)
    }
  }

  // Deletes screenshots older than 2 days
  const cleanupScreenshots = () => {
    logger.info('Cleaning up screenshots')
    try {
      const streamRecordingDirectories = getSubdirectories(screenshotsDirectory)

      streamRecordingDirectories.forEach((subdirectory) => {
        const streamRecordingDirectory = path.join(
          screenshotsDirectory,
          subdirectory,
        )
        const files = fs
          .readdirSync(streamRecordingDirectory)
          .filter(f => !f.startsWith('.'))
        const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000 // Calculate the timestamp for 2 days ago

        files.forEach((file) => {
          const filePath = path.join(streamRecordingDirectory, file)
          const fileStat = fs.statSync(filePath)

          if (fileStat.isFile() && fileStat.mtimeMs < twoDaysAgo) {
            fs.unlinkSync(filePath) // Delete the file if it's older than 2 days
            logger.info(`Deleted screenshot: ${filePath}`)
          }
        })
      })
    }
    catch (err) {
      throw new Error(`Error deleting files: ${err}`)
    }
  }

  const generateScreenshots = () => {
    logger.info('Scanning new recordings to generate new screenshots')
    const streamRecordingDirectories = getSubdirectories(recordingsDirectory)

    streamRecordingDirectories.forEach((subdirectory) => {
      const streamScreenshotDirectory = path.join(
        screenshotsDirectory,
        subdirectory,
      )
      if (!fs.existsSync(streamScreenshotDirectory)) {
        fs.mkdirSync(streamScreenshotDirectory)
        logger.info('Screenshots Directory created successfully.')
      }
      const filesInSubdir = getFileNamesWithoutExtension(
        path.join(recordingsDirectory, subdirectory),
      )
      const filesInOtherDirectory = getFileNamesWithoutExtension(
        path.join(streamScreenshotDirectory),
      )

      const recordingsWithoutScreenshots = filesInSubdir.filter(
        file => !filesInOtherDirectory.includes(file),
      )

      logger.info(
        `${recordingsWithoutScreenshots.length} Recordings without screenshots in: ${subdirectory}`,
      )

      recordingsWithoutScreenshots.forEach((recording) => {
        const cmd = 'ffmpeg'
        const inputFile = path.join(
          recordingsDirectory,
          subdirectory,
          `${recording}.mp4`,
        )
        const outputFile = path.join(
          streamScreenshotDirectory,
          `${recording}.png`,
        )
        const args = [
          '-ss',
          '00:00:00',
          '-i',
          inputFile,
          '-frames:v',
          '1',
          outputFile,
        ]
        const proc = cp.spawn(cmd, args)
        proc.on('error', (err) => {
          logger.error(`Failed to spawn ffmpeg for ${outputFile}`, err)
        })
        proc.stderr.setEncoding('utf8')

        proc.on('close', () => {
          logger.info(`Finished Generating screenshot ${outputFile}`)
        })
      })
    })
  }
  try {
    generateScreenshots()
    // Run every 30 mins
    cron.schedule('*/30 * * * *', async () => {
      generateScreenshots()
    })
  }
  catch (error) {
    logger.error('Unable to start generateScreenshots process', error)
  }

  try {
    cleanupScreenshots()
    // Run every day at midnight
    cron.schedule('0 0 0 * * *', async () => {
      cleanupScreenshots()
    })
  }
  catch (error) {
    logger.error('Unable to start cleanupScreenshots process', error)
  }
}
