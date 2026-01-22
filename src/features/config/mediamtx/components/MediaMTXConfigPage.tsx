import { getGlobalConfig } from '../actions/getGlobalConfig'
import { MediaMTXConfigForm } from './MediaMTXConfigForm'

export const dynamic = 'force-dynamic'

export async function MediaMTXConfigPage() {
  const globalConf = await getGlobalConfig()

  if (!globalConf) {
    return <div>Invalid Config</div>
  }

  return <MediaMTXConfigForm globalConf={globalConf} />
}
