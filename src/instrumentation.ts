export async function register() {
  // eslint-disable-next-line node/prefer-global/process
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: cron } = await import('node-cron')
    const { default: cp } = await import('node:child_process')
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const { default: logger } = await import('@/shared/utils/logger')
    const { env, isProduction } = await import('@/env')
    const { default: prisma } = await import('@/lib/prisma')

    logger.info('Starting background tasks', { NODE_ENV: env.NODE_ENV })

    let config = await prisma.config.findFirst()
    if (!config) {
      config = await prisma.config.create({
        data: {
          mediaMtxApiPort: 9997,
          mediaMtxUrl: 'http://mediamtx',
          recordingsDirectory: isProduction ? '/recordings' : './recordings',
          screenshotsDirectory: isProduction ? '/screenshots' : './screenshots',
          remoteMediaMtxUrl: 'http://localhost',
        },
      })
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
}
