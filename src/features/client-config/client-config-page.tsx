import { getTranslations } from 'next-intl/server'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { db } from '@/lib/db'

import { ClientConfigForm } from './client-config-form'

export const dynamic = 'force-dynamic'

export async function ClientConfigPage() {
  const t = await getTranslations('Config')
  const crumbs = [
    { label: t('crumbs.settings') },
    { label: t('crumbs.clientConfig') },
  ]
  const clientConfig = await db.config.findFirst()
  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header={t('pageHeader')} subHeader={t('pageSubHeader')}>
        <ClientConfigForm clientConfig={clientConfig} />
      </PageLayout>
    </>
  )
}
