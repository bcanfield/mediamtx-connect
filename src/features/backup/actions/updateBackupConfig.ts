'use server'

import type { BackupConfig } from '@prisma/client'

import prisma from '@/lib/prisma'
import { BackupConfigSchema } from '../schemas/backup-config.schema'

export async function updateBackupConfig({
  backupConfig,
}: {
  backupConfig: Partial<BackupConfig>
}): Promise<BackupConfig | null> {
  const validated = BackupConfigSchema.safeParse(backupConfig)

  if (!validated.success) {
    return null
  }

  const existingConfig = await prisma.backupConfig.findFirst()

  if (existingConfig) {
    return await prisma.backupConfig.update({
      where: { id: existingConfig.id },
      data: validated.data,
    })
  }

  return await prisma.backupConfig.create({
    data: validated.data,
  })
}
