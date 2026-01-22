'use server'

import type { Config } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import logger from '@/app/utils/logger'
import prisma from '@/lib/prisma'

export default async function updateClientConfig({
  clientConfig,
}: {
  clientConfig: Config
}): Promise<boolean> {
  logger.info('Updating Client Config')

  try {
    const updated = await prisma.config.update({
      where: {
        id: clientConfig.id,
      },
      data: clientConfig,
    })
    logger.debug('Updated config', { updated: updated as unknown as Record<string, unknown> })
    revalidatePath('/')
  }
  catch (error) {
    logger.error('Failed to update client config', error)
    return false
  }
  return true
}
