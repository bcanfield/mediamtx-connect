import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { ClientConfigForm } from './client-config-form'

export function ClientConfigPage() {
  const t = useTranslations('Config')
  const { data: clientConfig } = useQuery(orpc.config.app.get.queryOptions())
  return (
    <PageLayout
      width="narrow"
      header={t('appConfig.pageHeader')}
      subHeader={t('appConfig.pageSubHeader')}
    >
      {clientConfig && <ClientConfigForm clientConfig={clientConfig} />}
    </PageLayout>
  )
}
