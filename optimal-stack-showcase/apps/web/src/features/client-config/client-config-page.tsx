import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { ClientConfigForm } from './client-config-form'

export function ClientConfigPage() {
  const t = useTranslations('Config')
  const crumbs = [
    { label: t('crumbs.settings') },
    { label: t('crumbs.clientConfig') },
  ]
  const { data: clientConfig } = useQuery(orpc.config.app.get.queryOptions())
  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header={t('pageHeader')} subHeader={t('pageSubHeader')}>
        {clientConfig && <ClientConfigForm clientConfig={clientConfig} />}
      </PageLayout>
    </>
  )
}
