import type { StreamRecording } from './recordings.types'
import fs from 'node:fs'

import path from 'node:path'
import { getAppConfig } from '@/features/client-config/client-config.queries'
import { logger } from '@/lib/logger'

export async function getScreenshot({
  streamName,
  recordingFileName,
}: {
  streamName: string
  recordingFileName: string
}) {
  logger.debug('Getting screenshot')
  const config = await getAppConfig()
  if (!config) {
    return null
  }
  let base64: string | null = null

  const screenshotPath = path.join(
    config.screenshotsDirectory,
    streamName,
    `${path.parse(recordingFileName).name}.png`,
  )

  logger.debug('Screenshot path', { screenshotPath })
  try {
    const imageData = fs.readFileSync(screenshotPath)
    base64 = `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`
  }
  catch {
    logger.error(
      `Error fetching screenshot for: stream: ${streamName}, recording: ${recordingFileName}`,
    )
  }

  return base64
}

export async function getStreamRecordings({
  page = 1,
  take = 1,
  streamName,
}: {
  recordingsDirectory: string
  screenshotsDirectory: string
  page?: number
  take?: number
  streamName: string
}): Promise<StreamRecording[]> {
  const config = await getAppConfig()
  logger.debug('Getting Recordings')
  if (!config) {
    return []
  }
  const startIndex = (page - 1) * +take
  const endIndex = startIndex + +take

  const recordingFiles = fs
    .readdirSync(path.join(config.recordingsDirectory, streamName))
    .filter(f => !f.startsWith('.'))
    .sort((one, two) => (one > two ? -1 : 1))
    .slice(startIndex, endIndex)

  const recordingsWithTime: StreamRecording[] = await Promise.all(
    recordingFiles.map(async (r) => {
      const stat = fs.statSync(
        path.join(config.recordingsDirectory, streamName, r),
      )
      return {
        name: r,
        createdAt: stat.mtime,
        base64: await getScreenshot({
          recordingFileName: r,
          streamName,
        }),
        fileSize: stat.size,
      }
    }),
  )

  return recordingsWithTime
}
