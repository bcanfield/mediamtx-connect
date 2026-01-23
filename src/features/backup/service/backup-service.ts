import type { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import { logger } from '@/shared/utils/logger'
import { createS3BackupService } from './s3-backup-service'

export interface BackupResult {
  success: boolean
  localPath?: string
  remotePath?: string
  sizeBytes?: number
  errorMessage?: string
  remoteError?: string
  duration: number
}

export interface BackupService {
  performBackup: (type: 'database' | 'config' | 'full') => Promise<BackupResult>
  listBackups: () => Promise<string[]>
  restoreBackup: (backupPath: string) => Promise<boolean>
  cleanupOldBackups: () => Promise<void>
}

export function createBackupService(
  prisma: PrismaClient,
  databaseUrl: string,
): BackupService {
  const getDatabasePath = (): string => {
    // SQLite database path extraction from DATABASE_URL
    // Format: file:./path/to/db.sqlite or file:/absolute/path
    const dbPath = databaseUrl.replace('file:', '')
    return dbPath
  }

  const ensureDirectoryExists = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      logger.info(`Created backup directory: ${dirPath}`)
    }
  }

  const getBackupFilename = (type: string): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `backup-${type}-${timestamp}`
  }

  const cleanupOldBackups = async (): Promise<void> => {
    try {
      const backupConfig = await prisma.backupConfig.findFirst()
      if (!backupConfig) {
        return
      }

      const backupDir = backupConfig.localBackupDir
      const maxBackups = backupConfig.maxLocalBackups

      if (!fs.existsSync(backupDir)) {
        return
      }

      const files = fs
        .readdirSync(backupDir)
        .filter(f => f.startsWith('backup-'))
        .map((f) => {
          const fullPath = path.join(backupDir, f)
          const stats = fs.statSync(fullPath)
          return { name: f, path: fullPath, mtime: stats.mtime }
        })
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

      // Keep only the most recent maxBackups files
      const filesToDelete = files.slice(maxBackups)

      for (const file of filesToDelete) {
        fs.unlinkSync(file.path)
        logger.info(`Deleted old backup: ${file.name}`)
      }
    }
    catch (error) {
      logger.error('Failed to cleanup old backups', error)
    }
  }

  const listBackups = async (): Promise<string[]> => {
    try {
      const backupConfig = await prisma.backupConfig.findFirst()
      if (!backupConfig) {
        return []
      }

      const backupDir = backupConfig.localBackupDir
      if (!fs.existsSync(backupDir)) {
        return []
      }

      const files = fs.readdirSync(backupDir).filter((f) => {
        return f.startsWith('backup-') && f.endsWith('.sqlite')
      })

      return files.sort().reverse()
    }
    catch (error) {
      logger.error('Failed to list backups', error)
      return []
    }
  }

  const restoreBackup = async (backupPath: string): Promise<boolean> => {
    try {
      const backupConfig = await prisma.backupConfig.findFirst()
      if (!backupConfig) {
        logger.error('Backup configuration not found')
        return false
      }

      const fullBackupPath = path.join(backupConfig.localBackupDir, backupPath)
      const dbPath = getDatabasePath()

      if (!fs.existsSync(fullBackupPath)) {
        logger.error(`Backup file not found: ${fullBackupPath}`)
        return false
      }

      // Create a backup of current database before restoring
      const currentBackupPath = `${dbPath}.pre-restore-${Date.now()}`
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, currentBackupPath)
        logger.info(`Current database backed up to: ${currentBackupPath}`)
      }

      // Restore the backup
      fs.copyFileSync(fullBackupPath, dbPath)
      logger.info(`Database restored from: ${fullBackupPath}`)

      return true
    }
    catch (error) {
      logger.error('Failed to restore backup', error)
      return false
    }
  }

  const performBackup = async (
    type: 'database' | 'config' | 'full',
  ): Promise<BackupResult> => {
    const startTime = Date.now()

    try {
      const backupConfig = await prisma.backupConfig.findFirst()
      if (!backupConfig) {
        return {
          success: false,
          errorMessage: 'Backup configuration not found',
          duration: Date.now() - startTime,
        }
      }

      const backupDir = backupConfig.localBackupDir
      ensureDirectoryExists(backupDir)

      const filename = getBackupFilename(type)
      let localPath = ''
      let sizeBytes = 0

      if (type === 'database' || type === 'full') {
        const dbPath = getDatabasePath()
        const dbBackupPath = path.join(backupDir, `${filename}.sqlite`)

        // Copy the database file
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, dbBackupPath)
          const stats = fs.statSync(dbBackupPath)
          sizeBytes += stats.size
          localPath = dbBackupPath
          logger.info(`Database backed up to: ${dbBackupPath}`)
        }
        else {
          logger.warn(`Database file not found at: ${dbPath}`)
        }
      }

      if (type === 'config' || type === 'full') {
        // Export config as JSON
        const config = await prisma.config.findFirst()
        const configBackupPath = path.join(backupDir, `${filename}-config.json`)

        fs.writeFileSync(configBackupPath, JSON.stringify(config, null, 2))
        const stats = fs.statSync(configBackupPath)
        sizeBytes += stats.size

        if (type === 'config') {
          localPath = configBackupPath
        }
        logger.info(`Config backed up to: ${configBackupPath}`)
      }

      // Handle remote backup if enabled
      let remotePath: string | undefined
      let remoteError: string | undefined

      if (
        backupConfig.remoteEnabled
        && backupConfig.remoteType === 's3'
        && backupConfig.remoteBucket
        && backupConfig.remoteRegion
        && backupConfig.remoteAccessKey
        && backupConfig.remoteSecretKey
        && localPath
      ) {
        try {
          const s3Service = createS3BackupService({
            bucket: backupConfig.remoteBucket,
            region: backupConfig.remoteRegion,
            accessKey: backupConfig.remoteAccessKey,
            secretKey: backupConfig.remoteSecretKey,
            prefix: backupConfig.remotePrefix || 'backups/',
          })

          // Upload all backup files to S3
          const localFilename = path.basename(localPath)
          const uploadResult = await s3Service.uploadBackup(localPath, localFilename)

          if (uploadResult.success) {
            remotePath = uploadResult.remotePath
            logger.info(`Backup uploaded to S3 successfully: ${remotePath}`)

            // If this was a full backup, also upload the config file
            if (type === 'full') {
              const configFilename = localFilename.replace('.sqlite', '-config.json')
              const configPath = path.join(backupDir, configFilename)
              if (fs.existsSync(configPath)) {
                await s3Service.uploadBackup(configPath, configFilename)
              }
            }

            // Cleanup old remote backups
            await s3Service.cleanupOldBackups(backupConfig.maxLocalBackups)
          }
          else {
            remoteError = uploadResult.errorMessage
            logger.warn(`Remote backup failed, local backup succeeded: ${remoteError}`)
          }
        }
        catch (error) {
          remoteError = error instanceof Error ? error.message : 'Unknown S3 error'
          logger.error('Remote backup failed', error)
        }
      }

      // Record backup in history
      await prisma.backupHistory.create({
        data: {
          type,
          status: 'success',
          localPath,
          remotePath,
          sizeBytes,
          duration: Date.now() - startTime,
        },
      })

      // Cleanup old backups
      await cleanupOldBackups()

      return {
        success: true,
        localPath,
        remotePath,
        sizeBytes,
        remoteError,
        duration: Date.now() - startTime,
      }
    }
    catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Backup failed', error)

      // Record failed backup in history
      await prisma.backupHistory.create({
        data: {
          type,
          status: 'failed',
          errorMessage,
          duration: Date.now() - startTime,
        },
      })

      return {
        success: false,
        errorMessage,
        duration: Date.now() - startTime,
      }
    }
  }

  return {
    performBackup,
    listBackups,
    restoreBackup,
    cleanupOldBackups,
  }
}
