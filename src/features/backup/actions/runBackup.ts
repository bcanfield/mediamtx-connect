'use server'

import { env } from '@/env'
import prisma from '@/lib/prisma'

import { createBackupService } from '../service/backup-service'

export async function runBackup(type: 'database' | 'config' | 'full' = 'full') {
  const backupService = createBackupService(prisma, env.DATABASE_URL)
  const result = await backupService.performBackup(type)

  return result
}
