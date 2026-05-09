import { getTranslations } from 'next-intl/server'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { getGlobalConfig } from './mediamtx-config.queries'

export const dynamic = 'force-dynamic'

export async function MediaMTXConfigPage() {
  const t = await getTranslations('Config')
  const crumbs = [
    { label: t('crumbs.settings') },
    { label: t('crumbs.mediamtx') },
  ]
  const globalConf = await getGlobalConfig()

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header={t('pageHeader')} subHeader={t('pageSubHeader')}>
        {globalConf
          ? <MediaMTXConfigForm globalConf={globalConf} />
          : <div>{t('invalidConfig')}</div>}
      </PageLayout>
    </>
  )
}
