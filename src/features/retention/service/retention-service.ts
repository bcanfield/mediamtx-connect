import type { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import { logger } from '@/shared/utils/logger'

export interface CleanupResult {
  success: boolean
  filesDeleted: number
  bytesFreed: number
  deletedFiles: string[]
  errorMessage?: string
  duration: number
}

export interface RetentionService {
  performCleanup: (triggerType: 'scheduled' | 'storage_threshold' | 'manual') => Promise<CleanupResult>
  getRecordingStats: () => Promise<RecordingStats>
  checkStorageThreshold: () => Promise<boolean>
}

export interface RecordingStats {
  totalRecordings: number
  totalSizeBytes: number
  oldestRecording: Date | null
  newestRecording: Date | null
  recordingsByStream: Record<string, { count: number, sizeBytes: number }>
}

interface RecordingFile {
  path: string
  streamName: string
  fileName: string
  createdAt: Date
  sizeBytes: number
}

export function createRetentionService(
  prisma: PrismaClient,
  recordingsDirectory: string,
  screenshotsDirectory: string,
): RetentionService {
  /**
   * Get all recording files with their metadata
   */
  const getAllRecordings = (): RecordingFile[] => {
    const recordings: RecordingFile[] = []

    try {
      if (!fs.existsSync(recordingsDirectory)) {
        return recordings
      }

      const streamDirs = fs.readdirSync(recordingsDirectory, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))

      for (const streamDir of streamDirs) {
        const streamPath = path.join(recordingsDirectory, streamDir.name)
        const files = fs.readdirSync(streamPath)
          .filter(f => !f.startsWith('.') && f.endsWith('.mp4'))

        for (const file of files) {
          const filePath = path.join(streamPath, file)
          try {
            const stats = fs.statSync(filePath)
            recordings.push({
              path: filePath,
              streamName: streamDir.name,
              fileName: file,
              createdAt: stats.mtime,
              sizeBytes: stats.size,
            })
          }
          catch {
            // Skip files that can't be read
          }
        }
      }
    }
    catch (error) {
      logger.error('Failed to read recordings directory', error)
    }

    return recordings
  }

  /**
   * Delete associated screenshot for a recording
   */
  const deleteScreenshot = (streamName: string, recordingFileName: string): void => {
    try {
      const screenshotName = recordingFileName.replace(/\.mp4$/, '.png')
      const screenshotPath = path.join(screenshotsDirectory, streamName, screenshotName)

      if (fs.existsSync(screenshotPath)) {
        fs.unlinkSync(screenshotPath)
        logger.debug(`Deleted screenshot: ${screenshotPath}`)
      }
    }
    catch (error) {
      logger.error('Failed to delete screenshot', { streamName, recordingFileName, error })
    }
  }

  /**
   * Get disk space information
   */
  const getDiskSpace = (): { total: number, available: number, usagePercent: number } | null => {
    try {
      const stats = fs.statfsSync(recordingsDirectory)
      const blockSize = stats.bsize
      const totalBlocks = stats.blocks
      const availableBlocks = stats.bavail

      const total = totalBlocks * blockSize
      const available = availableBlocks * blockSize
      const used = total - available
      const usagePercent = total > 0 ? (used / total) * 100 : 0

      return { total, available, usagePercent }
    }
    catch {
      return null
    }
  }

  /**
   * Parse per-stream retention configuration
   */
  const parsePerStreamRetention = (jsonString: string | null): Record<string, number> => {
    if (!jsonString) {
      return {}
    }

    try {
      return JSON.parse(jsonString)
    }
    catch {
      return {}
    }
  }

  /**
   * Check if storage threshold is exceeded
   */
  const checkStorageThreshold = async (): Promise<boolean> => {
    const retentionConfig = await prisma.retentionConfig.findFirst()
    if (!retentionConfig) {
      return false
    }

    const diskSpace = getDiskSpace()
    if (!diskSpace) {
      return false
    }

    const minFreeSpaceBytes = retentionConfig.minFreeSpaceGB * 1024 * 1024 * 1024

    // Check if usage exceeds threshold or free space is below minimum
    return diskSpace.usagePercent >= retentionConfig.maxStoragePercent
      || diskSpace.available < minFreeSpaceBytes
  }

  /**
   * Get recording statistics
   */
  const getRecordingStats = async (): Promise<RecordingStats> => {
    const recordings = getAllRecordings()
    const recordingsByStream: Record<string, { count: number, sizeBytes: number }> = {}

    let totalSizeBytes = 0
    let oldestRecording: Date | null = null
    let newestRecording: Date | null = null

    for (const recording of recordings) {
      totalSizeBytes += recording.sizeBytes

      if (!recordingsByStream[recording.streamName]) {
        recordingsByStream[recording.streamName] = { count: 0, sizeBytes: 0 }
      }
      recordingsByStream[recording.streamName].count++
      recordingsByStream[recording.streamName].sizeBytes += recording.sizeBytes

      if (!oldestRecording || recording.createdAt < oldestRecording) {
        oldestRecording = recording.createdAt
      }
      if (!newestRecording || recording.createdAt > newestRecording) {
        newestRecording = recording.createdAt
      }
    }

    return {
      totalRecordings: recordings.length,
      totalSizeBytes,
      oldestRecording,
      newestRecording,
      recordingsByStream,
    }
  }

  /**
   * Perform cleanup based on retention configuration
   */
  const performCleanup = async (
    triggerType: 'scheduled' | 'storage_threshold' | 'manual',
  ): Promise<CleanupResult> => {
    const startTime = Date.now()
    const deletedFiles: string[] = []
    let bytesFreed = 0

    try {
      const retentionConfig = await prisma.retentionConfig.findFirst()
      if (!retentionConfig) {
        return {
          success: false,
          filesDeleted: 0,
          bytesFreed: 0,
          deletedFiles: [],
          errorMessage: 'Retention configuration not found',
          duration: Date.now() - startTime,
        }
      }

      if (!retentionConfig.enabled && triggerType !== 'manual') {
        return {
          success: true,
          filesDeleted: 0,
          bytesFreed: 0,
          deletedFiles: [],
          errorMessage: 'Retention is disabled',
          duration: Date.now() - startTime,
        }
      }

      const recordings = getAllRecordings()
      const perStreamRetention = parsePerStreamRetention(retentionConfig.perStreamRetentionDays)

      const now = new Date()
      const defaultMaxAgeMs = retentionConfig.maxAgeDays * 24 * 60 * 60 * 1000

      // Phase 1: Delete recordings based on age
      for (const recording of recordings) {
        // Check per-stream retention first, fallback to global
        const streamMaxAgeDays = perStreamRetention[recording.streamName]
        const maxAgeMs = streamMaxAgeDays !== undefined
          ? streamMaxAgeDays * 24 * 60 * 60 * 1000
          : defaultMaxAgeMs

        const ageMs = now.getTime() - recording.createdAt.getTime()

        if (ageMs > maxAgeMs) {
          try {
            fs.unlinkSync(recording.path)
            deleteScreenshot(recording.streamName, recording.fileName)
            deletedFiles.push(recording.path)
            bytesFreed += recording.sizeBytes
            logger.info(`Deleted old recording: ${recording.path}`, {
              age: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
              streamName: recording.streamName,
            })
          }
          catch (error) {
            logger.error('Failed to delete recording', { path: recording.path, error })
          }
        }
      }

      // Phase 2: Delete recordings based on storage threshold (if still exceeded)
      const diskSpace = getDiskSpace()
      const minFreeSpaceBytes = retentionConfig.minFreeSpaceGB * 1024 * 1024 * 1024

      if (
        diskSpace
        && (diskSpace.usagePercent >= retentionConfig.maxStoragePercent
          || diskSpace.available < minFreeSpaceBytes)
        && retentionConfig.deleteOldestFirst
      ) {
        // Get remaining recordings sorted by age (oldest first)
        const remainingRecordings = getAllRecordings()
          .filter(r => !deletedFiles.includes(r.path))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

        // Delete oldest recordings until we're under threshold
        for (const recording of remainingRecordings) {
          const currentDiskSpace = getDiskSpace()
          if (!currentDiskSpace) {
            break
          }

          // Check if we're now under both thresholds
          if (
            currentDiskSpace.usagePercent < retentionConfig.maxStoragePercent
            && currentDiskSpace.available >= minFreeSpaceBytes
          ) {
            break
          }

          try {
            fs.unlinkSync(recording.path)
            deleteScreenshot(recording.streamName, recording.fileName)
            deletedFiles.push(recording.path)
            bytesFreed += recording.sizeBytes
            logger.info(`Deleted recording for storage threshold: ${recording.path}`, {
              streamName: recording.streamName,
              usagePercent: currentDiskSpace.usagePercent.toFixed(2),
            })
          }
          catch (error) {
            logger.error('Failed to delete recording for storage', { path: recording.path, error })
          }
        }
      }

      // Record cleanup in history
      await prisma.cleanupHistory.create({
        data: {
          triggerType,
          filesDeleted: deletedFiles.length,
          bytesFreed,
          status: 'success',
          deletedFiles: JSON.stringify(deletedFiles),
          duration: Date.now() - startTime,
        },
      })

      logger.info('Recording cleanup completed', {
        triggerType,
        filesDeleted: deletedFiles.length,
        bytesFreed,
        duration: Date.now() - startTime,
      })

      return {
        success: true,
        filesDeleted: deletedFiles.length,
        bytesFreed,
        deletedFiles,
        duration: Date.now() - startTime,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Recording cleanup failed', error)

      // Record failed cleanup in history
      await prisma.cleanupHistory.create({
        data: {
          triggerType,
          filesDeleted: deletedFiles.length,
          bytesFreed,
          status: 'failed',
          errorMessage,
          deletedFiles: JSON.stringify(deletedFiles),
          duration: Date.now() - startTime,
        },
      })

      return {
        success: false,
        filesDeleted: deletedFiles.length,
        bytesFreed,
        deletedFiles,
        errorMessage,
        duration: Date.now() - startTime,
      }
    }
  }

  return {
    performCleanup,
    getRecordingStats,
    checkStorageThreshold,
  }
}
