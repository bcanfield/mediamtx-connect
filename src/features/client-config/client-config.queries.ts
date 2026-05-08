import type { Config } from '@prisma/client'

import { db } from '@/lib/db'

export async function getAppConfig(): Promise<Config | null> {
  return db.config.findFirst()
}
