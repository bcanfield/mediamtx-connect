import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { getGlobalConfig } from './mediamtx-config.queries'

export const dynamic = 'force-dynamic'

const crumbs = [
  { label: 'Settings' },
  { label: 'MediaMTX' },
]

export async function MediaMTXConfigPage() {
  const globalConf = await getGlobalConfig()

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header="Config" subHeader="Manage your App Configuration">
        {globalConf
          ? <MediaMTXConfigForm globalConf={globalConf} />
          : <div>Invalid Config</div>}
      </PageLayout>
    </>
  )
}
