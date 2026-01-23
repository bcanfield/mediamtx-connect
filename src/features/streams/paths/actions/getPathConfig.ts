'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { getAppConfig } from '@/features/config/client'
import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

export async function getPathConfig(name: string): Promise<PathConf | undefined> {
  const config = await getAppConfig()
  if (!config) {
    return undefined
  }

  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const response = await api.v3.configPathsGet(name, { cache: 'no-store' })
    return response?.data
  }
  catch {
    logger.error(`Error getting path config for: ${name}`)
    return undefined
  }
}
