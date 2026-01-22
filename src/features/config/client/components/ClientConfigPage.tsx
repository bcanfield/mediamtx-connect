import prisma from '@/lib/prisma'

import { ClientConfigForm } from './ClientConfigForm'

export const dynamic = 'force-dynamic'

export async function ClientConfigPage() {
  const clientConfig = await prisma.config.findFirst()
  return <ClientConfigForm clientConfig={clientConfig} />
}
