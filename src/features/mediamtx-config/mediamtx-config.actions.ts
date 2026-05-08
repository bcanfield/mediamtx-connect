'use server'

import type { GlobalConf } from '@/lib/mediamtx/generated'

import { getAppConfig } from '@/features/client-config/client-config.queries'
import { logger } from '@/lib/logger'
import { Api } from '@/lib/mediamtx/generated'

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
