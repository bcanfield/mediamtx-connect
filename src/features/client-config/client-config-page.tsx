import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { db } from '@/lib/db'

import { ClientConfigForm } from './client-config-form'

export const dynamic = 'force-dynamic'

const crumbs = [
  { label: 'Settings' },
  { label: 'Client Config' },
]

export async function ClientConfigPage() {
  const clientConfig = await db.config.findFirst()
  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout header="Config" subHeader="Manage your App Configuration">
        <ClientConfigForm clientConfig={clientConfig} />
      </PageLayout>
    </>
  )
}
