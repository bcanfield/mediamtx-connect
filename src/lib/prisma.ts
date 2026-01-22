import { PrismaClient } from '@prisma/client'
import { isProduction } from '@/env'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (!isProduction) {
  globalForPrisma.prisma = prisma
}

export default prisma
