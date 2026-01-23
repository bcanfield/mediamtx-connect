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

    const generateScreenshots = async () => {
      logger.info('Scanning new recordings to generate new screenshots')
      logger.info(`Recordings directory: ${recordingsDirectory}`)
      logger.info(`Screenshots directory: ${screenshotsDirectory}`)
      const streamRecordingDirectories = getSubdirectories(recordingsDirectory)
      logger.info(`Found ${streamRecordingDirectories.length} stream directories: ${streamRecordingDirectories.join(', ')}`)

      // Collect all screenshot tasks
      const tasks: Array<{ recording: string, inputFile: string, outputFile: string }> = []

      for (const subdirectory of streamRecordingDirectories) {
        const streamScreenshotDirectory = path.join(
          screenshotsDirectory,
          subdirectory,
        )
        if (!fs.existsSync(streamScreenshotDirectory)) {
          fs.mkdirSync(streamScreenshotDirectory, { recursive: true })
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

        for (const recording of recordingsWithoutScreenshots) {
          const inputFile = path.join(recordingsDirectory, subdirectory, `${recording}.mp4`)
          // Skip files smaller than 100KB (likely incomplete/corrupt fragmented MP4s)
          try {
            const stats = fs.statSync(inputFile)
            if (stats.size < 100 * 1024) {
              logger.debug(`Skipping small file (likely incomplete): ${recording}`)
              continue
            }
          }
          catch {
            continue // File doesn't exist or can't be read
          }
          tasks.push({
            recording,
            inputFile,
            outputFile: path.join(streamScreenshotDirectory, `${recording}.png`),
          })
        }
      }

      // Process with concurrency limit
      const MAX_CONCURRENT = 3
      let activeCount = 0
      let taskIndex = 0

      const processNext = (): Promise<void> => {
        return new Promise((resolve) => {
          const processTask = () => {
            if (taskIndex >= tasks.length) {
              if (activeCount === 0) {
                logger.info(`Screenshot generation complete. Processed ${tasks.length} files.`)
                resolve()
              }
              return
            }

            while (activeCount < MAX_CONCURRENT && taskIndex < tasks.length) {
              const task = tasks[taskIndex++]
              activeCount++

              const args = [
                '-y', // Overwrite without asking
                '-ss',
                '00:00:00',
                '-i',
                task.inputFile,
                '-frames:v',
                '1',
                '-update',
                '1', // Fix for single image output
                task.outputFile,
              ]

              logger.debug(`Generating screenshot for ${task.recording}`)
              const proc = cp.spawn('ffmpeg', args)

              let stderr = ''
              proc.stderr.on('data', (data) => {
                stderr += data.toString()
              })

              proc.on('error', (err) => {
                logger.error(`Failed to spawn ffmpeg for ${task.recording}`, { error: err.message })
                activeCount--
                processTask()
              })

              proc.on('close', (code) => {
                activeCount--
                if (code === 0) {
                  logger.info(`Generated screenshot: ${task.recording}`)
                }
                else {
                  // "moov atom not found" means incomplete/corrupt MP4 - expected for interrupted recordings
                  const isCorruptFile = stderr.includes('moov atom not found')
                  if (isCorruptFile) {
                    logger.debug(`Skipped corrupt/incomplete recording: ${task.recording}`)
                  }
                  else {
                    logger.warn(`ffmpeg failed for ${task.recording}`, { code, stderr: stderr.slice(-300) })
                  }
                }
                processTask()
              })
            }
          }

          processTask()
        })
      }

      logger.info(`Total tasks queued: ${tasks.length}`)
      if (tasks.length > 0) {
        await processNext()
      }
      else {
        logger.info('No new screenshots to generate')
      }
    }
    try {
      await generateScreenshots()
      // Run every 30 mins
      cron.schedule('*/30 * * * *', async () => {
        await generateScreenshots()
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

    // Automated Backup Scheduler
    try {
      const { createBackupService } = await import('@/features/backup/service/backup-service')
      const backupService = createBackupService(prisma, env.DATABASE_URL)

      // Initialize backup config if not exists
      let backupConfig = await prisma.backupConfig.findFirst()
      if (!backupConfig) {
        backupConfig = await prisma.backupConfig.create({
          data: {
            enabled: false,
            schedule: '0 2 * * *', // 2 AM daily
            localBackupDir: isProduction ? '/backups' : './backups',
            maxLocalBackups: 7,
            remoteEnabled: false,
          },
        })
        logger.info('Created default backup configuration')
      }

      // Create backup directory if enabled
      if (backupConfig.enabled) {
        await createDirectoryIfNotExists(backupConfig.localBackupDir)
      }

      // Store the scheduled task reference for potential updates
      let backupTask: ReturnType<typeof cron.schedule> | null = null

      const scheduleBackup = async () => {
        // Refresh config to get latest settings
        const currentConfig = await prisma.backupConfig.findFirst()
        if (!currentConfig || !currentConfig.enabled) {
          if (backupTask) {
            backupTask.stop()
            backupTask = null
            logger.info('Backup scheduler stopped - backups disabled')
          }
          return
        }

        // If schedule changed or no task exists, reschedule
        if (backupTask) {
          backupTask.stop()
        }

        if (cron.validate(currentConfig.schedule)) {
          backupTask = cron.schedule(currentConfig.schedule, async () => {
            logger.info('Running scheduled backup')
            const result = await backupService.performBackup('full')
            if (result.success) {
              logger.info('Scheduled backup completed successfully', {
                duration: result.duration,
                sizeBytes: result.sizeBytes,
              })
            }
            else {
              logger.error('Scheduled backup failed', { error: result.errorMessage })
            }
          })
          logger.info('Backup scheduler started', { schedule: currentConfig.schedule })
        }
        else {
          logger.error('Invalid cron expression for backup schedule', {
            schedule: currentConfig.schedule,
          })
        }
      }

      // Initial schedule setup
      await scheduleBackup()

      // Check for config changes every 5 minutes and reschedule if needed
      cron.schedule('*/5 * * * *', async () => {
        await scheduleBackup()
      })
    }
    catch (error) {
      logger.error('Unable to start backup scheduler', error)
    }

    // Automated Recording Retention Cleanup Scheduler
    try {
      const { createRetentionService } = await import('@/features/retention/service/retention-service')
      const retentionService = createRetentionService(prisma, recordingsDirectory, screenshotsDirectory)

      // Initialize retention config if not exists
      let retentionConfig = await prisma.retentionConfig.findFirst()
      if (!retentionConfig) {
        retentionConfig = await prisma.retentionConfig.create({
          data: {
            enabled: false,
            schedule: '0 3 * * *', // 3 AM daily
            maxAgeDays: 30,
            maxStoragePercent: 90,
            minFreeSpaceGB: 10,
            deleteOldestFirst: true,
          },
        })
        logger.info('Created default retention configuration')
      }

      // Store the scheduled task reference for potential updates
      let retentionTask: ReturnType<typeof cron.schedule> | null = null

      const scheduleRetentionCleanup = async () => {
        // Refresh config to get latest settings
        const currentConfig = await prisma.retentionConfig.findFirst()
        if (!currentConfig || !currentConfig.enabled) {
          if (retentionTask) {
            retentionTask.stop()
            retentionTask = null
            logger.info('Retention cleanup scheduler stopped - cleanup disabled')
          }
          return
        }

        // If schedule changed or no task exists, reschedule
        if (retentionTask) {
          retentionTask.stop()
        }

        if (cron.validate(currentConfig.schedule)) {
          retentionTask = cron.schedule(currentConfig.schedule, async () => {
            logger.info('Running scheduled recording cleanup')
            const result = await retentionService.performCleanup('scheduled')
            if (result.success) {
              logger.info('Scheduled recording cleanup completed successfully', {
                duration: result.duration,
                filesDeleted: result.filesDeleted,
                bytesFreed: result.bytesFreed,
              })
            }
            else {
              logger.error('Scheduled recording cleanup failed', { error: result.errorMessage })
            }
          })
          logger.info('Retention cleanup scheduler started', { schedule: currentConfig.schedule })
        }
        else {
          logger.error('Invalid cron expression for retention cleanup schedule', {
            schedule: currentConfig.schedule,
          })
        }
      }

      // Initial schedule setup
      await scheduleRetentionCleanup()

      // Check for config changes every 5 minutes and reschedule if needed
      cron.schedule('*/5 * * * *', async () => {
        await scheduleRetentionCleanup()
      })

      // Also check storage threshold every hour and trigger cleanup if needed
      cron.schedule('0 * * * *', async () => {
        const currentConfig = await prisma.retentionConfig.findFirst()
        if (currentConfig && currentConfig.enabled) {
          const thresholdExceeded = await retentionService.checkStorageThreshold()
          if (thresholdExceeded) {
            logger.info('Storage threshold exceeded, triggering automatic cleanup')
            const result = await retentionService.performCleanup('storage_threshold')
            if (result.success) {
              logger.info('Storage threshold cleanup completed', {
                filesDeleted: result.filesDeleted,
                bytesFreed: result.bytesFreed,
              })
            }
            else {
              logger.error('Storage threshold cleanup failed', { error: result.errorMessage })
            }
          }
        }
      })
    }
    catch (error) {
      logger.error('Unable to start retention cleanup scheduler', error)
    }
  }
}
