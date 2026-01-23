'use server'

import type { RecordingStats } from '../service/retention-service'
import { getAppConfig } from '@/features/config/client'
import prisma from '@/lib/prisma'
import { createRetentionService } from '../service/retention-service'

export async function getRecordingStats(): Promise<RecordingStats | null> {
  const config = await getAppConfig()

  if (!config) {
    return null
  }

  const retentionService = createRetentionService(
    prisma,
    config.recordingsDirectory,
    config.screenshotsDirectory,
  )

  return await retentionService.getRecordingStats()
}
