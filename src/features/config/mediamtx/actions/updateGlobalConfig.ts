'use server'

import type { GlobalConf } from '@/lib/MediaMTX/generated'

import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

import { getAppConfig } from '../../client'

export async function updateGlobalConfig({
  globalConfig,
}: {
  globalConfig: GlobalConf
}): Promise<boolean> {
  const config = await getAppConfig()
  if (!config) {
    return false
  }
  logger.info('Updating Global Config')
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const resp = await api.v3.configGlobalSet(globalConfig)
    const status = resp.status
    if (status !== 200) {
      throw new Error(`Error setting global config: ${status}`)
    }

    logger.debug('Global config updated', { status })
  }
  catch (error) {
    logger.error('Failed to update global config', error)
    return false
  }
  return true
}
