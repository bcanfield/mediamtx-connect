'use server'

import type { BackupConfig } from '@prisma/client'

import prisma from '@/lib/prisma'

export async function getBackupConfig(): Promise<BackupConfig | null> {
  return await prisma.backupConfig.findFirst()
}
