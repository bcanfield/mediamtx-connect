'use server'

import type { RetentionConfig } from '@prisma/client'

import prisma from '@/lib/prisma'

export async function getRetentionConfig(): Promise<RetentionConfig | null> {
  return await prisma.retentionConfig.findFirst()
}
