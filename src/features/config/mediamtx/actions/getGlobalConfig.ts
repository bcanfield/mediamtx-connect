'use server'

import type { GlobalConf } from '@/lib/MediaMTX/generated'

import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

import { getAppConfig } from '../../client'

export async function getGlobalConfig(): Promise<GlobalConf | undefined> {
  const config = await getAppConfig()
  if (!config) {
    return undefined
  }

  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const mediaMtxConfig = await api.v3.configGlobalGet({ cache: 'no-store' })
    return mediaMtxConfig?.data
  }
  catch {
    logger.error(`Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
    return undefined
  }
}
