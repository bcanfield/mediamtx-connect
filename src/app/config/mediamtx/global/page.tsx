import type { GlobalConf } from '@/lib/MediaMTX/generated'
import getAppConfig from '@/actions/getAppConfig'
import logger from '@/app/utils/logger'
import { Api } from '@/lib/MediaMTX/generated'
import ConfigForm from '../../config-form'

export const dynamic = 'force-dynamic'

export default async function Global() {
  const config = await getAppConfig()
  if (!config) {
    return <div>Invalid Config</div>
  }
  let globalConf: GlobalConf | undefined
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    const mediaMtxConfig = await api.v3.configGlobalGet({ cache: 'no-store' })
    globalConf = mediaMtxConfig?.data
  }
  catch {
    logger.error(`Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
  }
  return <ConfigForm globalConf={globalConf} />
}
