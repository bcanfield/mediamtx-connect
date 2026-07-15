import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'

export function MediaMTXConfigPage() {
  const t = useTranslations('Config')
  const crumbs = [
    { label: t('crumbs.settings') },
    { label: t('crumbs.mediamtx') },
  ]
  const globalConf = useQuery(orpc.config.mediamtx.getGlobal.queryOptions())

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header={t('pageHeader')} subHeader={t('pageSubHeader')}>
        {globalConf.isSuccess && (
          globalConf.data
            ? <MediaMTXConfigForm globalConf={globalConf.data} />
            : <div>{t('invalidConfig')}</div>
        )}
      </PageLayout>
    </>
  )
}
