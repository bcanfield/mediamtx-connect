import { PrismaClient } from '@prisma/client'
import { isProduction } from '@/lib/env'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (!isProduction) {
  globalForPrisma.prisma = db
}
