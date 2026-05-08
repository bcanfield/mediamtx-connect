import { MediaMTXConfigForm } from './mediamtx-config-form'
import { getGlobalConfig } from './mediamtx-config.queries'

export const dynamic = 'force-dynamic'

export async function MediaMTXConfigPage() {
  const globalConf = await getGlobalConfig()

  if (!globalConf) {
    return <div>Invalid Config</div>
  }

  return <MediaMTXConfigForm globalConf={globalConf} />
}
