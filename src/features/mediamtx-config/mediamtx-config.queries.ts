import type { GlobalConf } from '@/lib/mediamtx/generated'

import { getAppConfig } from '@/features/client-config/client-config.queries'
import { logger } from '@/lib/logger'
import { Api } from '@/lib/mediamtx/generated'

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
