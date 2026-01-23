'use server'

import type { PathConfList } from '@/lib/MediaMTX/generated'

import { getAppConfig } from '@/features/config/client'
import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

export async function getPathsList(): Promise<PathConfList | undefined> {
  const config = await getAppConfig()
  if (!config) {
    return undefined
  }

  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const response = await api.v3.configPathsList({}, { cache: 'no-store' })
    return response?.data
  }
  catch {
    logger.error(`Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
    return undefined
  }
}
