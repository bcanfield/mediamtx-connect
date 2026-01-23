'use server'

import type { CleanupHistory } from '@prisma/client'

import prisma from '@/lib/prisma'

export async function getCleanupHistory(limit = 20): Promise<CleanupHistory[]> {
  return await prisma.cleanupHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
