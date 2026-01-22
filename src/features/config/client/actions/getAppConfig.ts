'use server'

import type { Config } from '@prisma/client'

import prisma from '@/lib/prisma'

export async function getAppConfig(): Promise<Config | null> {
  return await prisma.config.findFirst()
}
