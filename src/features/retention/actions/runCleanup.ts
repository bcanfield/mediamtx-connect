'use server'

import { getAppConfig } from '@/features/config/client'
import prisma from '@/lib/prisma'
import { createRetentionService } from '../service/retention-service'

export interface RunCleanupResult {
  success: boolean
  filesDeleted: number
  bytesFreed: number
  errorMessage?: string
}

export async function runCleanup(): Promise<RunCleanupResult> {
  const config = await getAppConfig()

  if (!config) {
    return {
      success: false,
      filesDeleted: 0,
      bytesFreed: 0,
      errorMessage: 'Application configuration not found',
    }
  }

  const retentionService = createRetentionService(
    prisma,
    config.recordingsDirectory,
    config.screenshotsDirectory,
  )

  const result = await retentionService.performCleanup('manual')

  return {
    success: result.success,
    filesDeleted: result.filesDeleted,
    bytesFreed: result.bytesFreed,
    errorMessage: result.errorMessage,
  }
}
