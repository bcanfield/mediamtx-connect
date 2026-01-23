'use server'

import type { GetRecordingsResult, RecordingFilters, StreamRecording } from '../types'
import fs from 'node:fs'

import path from 'node:path'
import { getAppConfig } from '@/features/config/client'

import { logger } from '@/shared/utils'
import { getScreenshot } from './getScreenshot'

export async function getStreamRecordings({
  page = 1,
  take = 1,
  streamName,
  filters = {},
}: {
  recordingsDirectory: string
  screenshotsDirectory: string
  page?: number
  take?: number
  streamName: string
  filters?: RecordingFilters
}): Promise<GetRecordingsResult> {
  const config = await getAppConfig()
  logger.debug('Getting Recordings with filters', { filters })
  if (!config) {
    return { recordings: [], totalCount: 0, filteredCount: 0 }
  }

  const recordingsPath = path.join(config.recordingsDirectory, streamName)

  // Get all files with their stats for filtering
  const allFiles = fs
    .readdirSync(recordingsPath)
    .filter(f => !f.startsWith('.'))

  const totalCount = allFiles.length

  // Get file stats for filtering
  const filesWithStats = allFiles.map((fileName) => {
    const stat = fs.statSync(path.join(recordingsPath, fileName))
    return {
      name: fileName,
      createdAt: stat.mtime,
      fileSize: stat.size,
    }
  })

  // Apply filters
  let filteredFiles = filesWithStats

  // Search filter (by filename)
  if (filters.search && filters.search.trim() !== '') {
    const searchLower = filters.search.toLowerCase().trim()
    filteredFiles = filteredFiles.filter(f =>
      f.name.toLowerCase().includes(searchLower),
    )
  }

  // Date range filter
  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom)
    dateFrom.setHours(0, 0, 0, 0)
    filteredFiles = filteredFiles.filter(f => f.createdAt >= dateFrom)
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo)
    dateTo.setHours(23, 59, 59, 999)
    filteredFiles = filteredFiles.filter(f => f.createdAt <= dateTo)
  }

  // File size filter (in MB)
  if (filters.fileSizeMin !== undefined && filters.fileSizeMin > 0) {
    const minBytes = filters.fileSizeMin * 1024 * 1024
    filteredFiles = filteredFiles.filter(f => f.fileSize >= minBytes)
  }

  if (filters.fileSizeMax !== undefined && filters.fileSizeMax > 0) {
    const maxBytes = filters.fileSizeMax * 1024 * 1024
    filteredFiles = filteredFiles.filter(f => f.fileSize <= maxBytes)
  }

  const filteredCount = filteredFiles.length

  // Sort and paginate
  const startIndex = (page - 1) * +take
  const endIndex = startIndex + +take

  const paginatedFiles = filteredFiles
    .sort((one, two) => (one.name > two.name ? -1 : 1))
    .slice(startIndex, endIndex)

  // Get screenshots for paginated results
  const recordingsWithScreenshots: StreamRecording[] = await Promise.all(
    paginatedFiles.map(async (file) => {
      return {
        name: file.name,
        createdAt: file.createdAt,
        base64: await getScreenshot({
          recordingFileName: file.name,
          streamName,
        }),
        fileSize: file.fileSize,
      }
    }),
  )

  return {
    recordings: recordingsWithScreenshots,
    totalCount,
    filteredCount,
  }
}
