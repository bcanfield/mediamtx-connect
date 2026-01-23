import fs from 'node:fs'
import path from 'node:path'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

import { logger } from '@/shared/utils/logger'

export interface S3Config {
  bucket: string
  region: string
  accessKey: string
  secretKey: string
  prefix?: string
}

export interface S3UploadResult {
  success: boolean
  remotePath?: string
  errorMessage?: string
}

export interface S3BackupService {
  testConnection: () => Promise<{ success: boolean, errorMessage?: string }>
  uploadBackup: (localPath: string, filename: string) => Promise<S3UploadResult>
  downloadBackup: (remotePath: string, localPath: string) => Promise<boolean>
  deleteBackup: (remotePath: string) => Promise<boolean>
  listRemoteBackups: () => Promise<string[]>
  cleanupOldBackups: (maxBackups: number) => Promise<void>
}

export function createS3BackupService(config: S3Config): S3BackupService {
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  })

  const getFullPath = (filename: string): string => {
    const prefix = config.prefix || 'backups/'
    return `${prefix}${filename}`
  }

  const testConnection = async (): Promise<{ success: boolean, errorMessage?: string }> => {
    try {
      await client.send(new HeadBucketCommand({ Bucket: config.bucket }))
      logger.info(`S3 connection test successful for bucket: ${config.bucket}`)
      return { success: true }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown S3 connection error'
      logger.error(`S3 connection test failed for bucket: ${config.bucket}`, error)
      return { success: false, errorMessage }
    }
  }

  const uploadBackup = async (localPath: string, filename: string): Promise<S3UploadResult> => {
    try {
      if (!fs.existsSync(localPath)) {
        return {
          success: false,
          errorMessage: `Local file not found: ${localPath}`,
        }
      }

      const fileContent = fs.readFileSync(localPath)
      const remotePath = getFullPath(filename)

      await client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: remotePath,
        Body: fileContent,
        ContentType: 'application/octet-stream',
      }))

      logger.info(`Backup uploaded to S3: ${remotePath}`, { localPath, bucket: config.bucket })

      return {
        success: true,
        remotePath: `s3://${config.bucket}/${remotePath}`,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown S3 upload error'
      logger.error(`Failed to upload backup to S3: ${localPath}`, error)
      return { success: false, errorMessage }
    }
  }

  const downloadBackup = async (remotePath: string, localPath: string): Promise<boolean> => {
    try {
      // Extract the key from s3:// URL if provided
      let key = remotePath
      if (remotePath.startsWith('s3://')) {
        const url = new URL(remotePath.replace('s3://', 'https://'))
        key = url.pathname.slice(1) // Remove leading slash
      }

      const response = await client.send(new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }))

      if (!response.Body) {
        logger.error(`S3 response body is empty for: ${remotePath}`)
        return false
      }

      // Ensure directory exists
      const dir = path.dirname(localPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Convert stream to buffer and write
      const chunks: Uint8Array[] = []
      const stream = response.Body as AsyncIterable<Uint8Array>
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)
      fs.writeFileSync(localPath, buffer)

      logger.info(`Backup downloaded from S3: ${remotePath}`, { localPath })
      return true
    }
    catch (error) {
      logger.error(`Failed to download backup from S3: ${remotePath}`, error)
      return false
    }
  }

  const deleteBackup = async (remotePath: string): Promise<boolean> => {
    try {
      // Extract the key from s3:// URL if provided
      let key = remotePath
      if (remotePath.startsWith('s3://')) {
        const url = new URL(remotePath.replace('s3://', 'https://'))
        key = url.pathname.slice(1) // Remove leading slash
      }

      await client.send(new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }))

      logger.info(`Backup deleted from S3: ${remotePath}`, { bucket: config.bucket })
      return true
    }
    catch (error) {
      logger.error(`Failed to delete backup from S3: ${remotePath}`, error)
      return false
    }
  }

  const listRemoteBackups = async (): Promise<string[]> => {
    try {
      const prefix = config.prefix || 'backups/'
      const response = await client.send(new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
      }))

      if (!response.Contents) {
        return []
      }

      // Sort by last modified date (newest first)
      const sorted = response.Contents
        .filter(obj => obj.Key && obj.Key.includes('backup-'))
        .sort((a, b) => {
          const dateA = a.LastModified?.getTime() || 0
          const dateB = b.LastModified?.getTime() || 0
          return dateB - dateA
        })

      return sorted.map(obj => obj.Key || '').filter(Boolean)
    }
    catch (error) {
      logger.error('Failed to list remote backups', error)
      return []
    }
  }

  const cleanupOldBackups = async (maxBackups: number): Promise<void> => {
    try {
      const backups = await listRemoteBackups()

      if (backups.length <= maxBackups) {
        return
      }

      const backupsToDelete = backups.slice(maxBackups)

      for (const backup of backupsToDelete) {
        await deleteBackup(backup)
        logger.info(`Deleted old remote backup: ${backup}`)
      }
    }
    catch (error) {
      logger.error('Failed to cleanup old remote backups', error)
    }
  }

  return {
    testConnection,
    uploadBackup,
    downloadBackup,
    deleteBackup,
    listRemoteBackups,
    cleanupOldBackups,
  }
}
