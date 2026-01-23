'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { revalidatePath } from 'next/cache'

import { getAppConfig } from '@/features/config/client'
import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

export async function createPathConfig({
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

  logger.info('Creating Path Config', { name })
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const resp = await api.v3.configPathsAdd(name, pathConfig)
    const status = resp.status
    if (status !== 200) {
      throw new Error(`Error creating path config: ${status}`)
    }

    logger.debug('Path config created', { name, status })
    revalidatePath('/config/paths')
  }
  catch (error) {
    logger.error('Failed to create path config', error)
    return false
  }
  return true
}
