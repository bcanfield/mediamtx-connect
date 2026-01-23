'use server'

import type { BackupHistory } from '@prisma/client'

import prisma from '@/lib/prisma'

export async function getBackupHistory(
  limit: number = 20,
): Promise<BackupHistory[]> {
  return await prisma.backupHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
