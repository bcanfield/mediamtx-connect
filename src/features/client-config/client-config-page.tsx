import { db } from '@/lib/db'

import { ClientConfigForm } from './client-config-form'

export const dynamic = 'force-dynamic'

export async function ClientConfigPage() {
  const clientConfig = await db.config.findFirst()
  return <ClientConfigForm clientConfig={clientConfig} />
}
