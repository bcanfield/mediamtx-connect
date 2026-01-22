'use server'
import fs from 'node:fs'
import path from 'node:path'
import logger from '@/app/utils/logger'

import getAppConfig from './getAppConfig'

export default async function getScreenshot({
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
    base64 = `data:image/png;base64,${Buffer.from(imageData).toString(
      'base64',
    )}`
  }
  catch {
    logger.error(
      `Error fetching screenshot for: stream: ${streamName}, recording: ${recordingFileName}`,
    )
  }

  return base64
}
