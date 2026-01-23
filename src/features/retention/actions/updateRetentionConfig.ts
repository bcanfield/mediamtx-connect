'use server'

import type { RetentionConfig } from '@prisma/client'

import prisma from '@/lib/prisma'
import { RetentionConfigSchema } from '../schemas/retention-config.schema'

export async function updateRetentionConfig({
  retentionConfig,
}: {
  retentionConfig: Partial<RetentionConfig>
}): Promise<RetentionConfig | null> {
  const validated = RetentionConfigSchema.safeParse(retentionConfig)

  if (!validated.success) {
    return null
  }

  const existingConfig = await prisma.retentionConfig.findFirst()

  if (existingConfig) {
    return await prisma.retentionConfig.update({
      where: { id: existingConfig.id },
      data: validated.data,
    })
  }

  return await prisma.retentionConfig.create({
    data: validated.data,
  })
}
