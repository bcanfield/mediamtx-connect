'use server'

import { revalidatePath } from 'next/cache'

import { getAppConfig } from '@/features/config/client'
import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

export async function deletePathConfig(name: string): Promise<boolean> {
  const config = await getAppConfig()
  if (!config) {
    return false
  }

  logger.info('Deleting Path Config', { name })
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const resp = await api.v3.configPathsDelete(name)
    const status = resp.status
    if (status !== 200) {
      throw new Error(`Error deleting path config: ${status}`)
    }

    logger.debug('Path config deleted', { name, status })
    revalidatePath('/config/paths')
  }
  catch (error) {
    logger.error('Failed to delete path config', error)
    return false
  }
  return true
}
