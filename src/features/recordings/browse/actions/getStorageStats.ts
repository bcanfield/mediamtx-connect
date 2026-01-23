'use server'

import fs from 'node:fs'
import path from 'node:path'

export interface StorageStats {
  totalSpace: number
  usedSpace: number
  availableSpace: number
  recordingsSize: number
  usagePercentage: number
  warningLevel: 'none' | 'low' | 'critical'
}

/**
 * Calculate the total size of a directory recursively
 */
function getDirectorySize(directoryPath: string): number {
  let totalSize = 0

  try {
    const items = fs.readdirSync(directoryPath, { withFileTypes: true })

    for (const item of items) {
      const itemPath = path.join(directoryPath, item.name)

      if (item.isDirectory()) {
        totalSize += getDirectorySize(itemPath)
      }
      else if (item.isFile()) {
        try {
          const stats = fs.statSync(itemPath)
          totalSize += stats.size
        }
        catch {
          // Skip files that can't be read
        }
      }
    }
  }
  catch {
    // Return 0 if directory can't be read
  }

  return totalSize
}

/**
 * Get disk space information for the filesystem containing the given path
 */
function getDiskSpace(directoryPath: string): { total: number, available: number } | null {
  try {
    // Use statfs on Node.js 18.15+ or fallback to statvfs-like behavior
    const stats = fs.statfsSync(directoryPath)
    const blockSize = stats.bsize
    const totalBlocks = stats.blocks
    const availableBlocks = stats.bavail

    return {
      total: totalBlocks * blockSize,
      available: availableBlocks * blockSize,
    }
  }
  catch {
    return null
  }
}

/**
 * Get storage statistics for the recordings directory
 */
export async function getStorageStats(recordingsDirectory: string): Promise<StorageStats | null> {
  try {
    // Check if directory exists
    if (!fs.existsSync(recordingsDirectory)) {
      return null
    }

    // Get recordings directory size
    const recordingsSize = getDirectorySize(recordingsDirectory)

    // Get disk space info
    const diskSpace = getDiskSpace(recordingsDirectory)

    if (!diskSpace) {
      return null
    }

    const { total: totalSpace, available: availableSpace } = diskSpace
    const usedSpace = totalSpace - availableSpace
    const usagePercentage = totalSpace > 0 ? (usedSpace / totalSpace) * 100 : 0

    // Determine warning level
    let warningLevel: 'none' | 'low' | 'critical' = 'none'
    if (usagePercentage >= 95) {
      warningLevel = 'critical'
    }
    else if (usagePercentage >= 85) {
      warningLevel = 'low'
    }

    return {
      totalSpace,
      usedSpace,
      availableSpace,
      recordingsSize,
      usagePercentage,
      warningLevel,
    }
  }
  catch {
    return null
  }
}
