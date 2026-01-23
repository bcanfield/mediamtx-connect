'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { revalidatePath } from 'next/cache'

import { getAppConfig } from '@/features/config/client'
import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

export async function updatePathConfig({
  name,
  pathConfig,
}: {
  name: string
  pathConfig: PathConf
}): Promise<boolean> {
  const config = await getAppConfig()
  if (!config) {
    return false
  }

  logger.info('Updating Path Config', { name })
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const resp = await api.v3.configPathsPatch(name, pathConfig)
    const status = resp.status
    if (status !== 200) {
      throw new Error(`Error updating path config: ${status}`)
    }

    logger.debug('Path config updated', { name, status })
    revalidatePath('/config/paths')
    revalidatePath(`/config/paths/${name}`)
  }
  catch (error) {
    logger.error('Failed to update path config', error)
    return false
  }
  return true
}
