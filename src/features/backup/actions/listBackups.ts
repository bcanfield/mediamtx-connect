'use server'

import { env } from '@/env'
import prisma from '@/lib/prisma'

import { createBackupService } from '../service/backup-service'

export async function listBackups(): Promise<string[]> {
  const backupService = createBackupService(prisma, env.DATABASE_URL)
  return await backupService.listBackups()
}
