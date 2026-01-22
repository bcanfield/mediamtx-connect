import { PrismaClient } from '@prisma/client'
import logger from '../../shared/utils/logger'
import { env } from '../../env'

const prisma = new PrismaClient()

async function main() {
  logger.info('Seeding database...')

  // Delete existing config to ensure clean state
  await prisma.config.deleteMany()

  // Create development configuration
  const config = await prisma.config.create({
    data: {
      mediaMtxUrl: env.BACKEND_SERVER_MEDIAMTX_URL,
      mediaMtxApiPort: Number.parseInt(env.MEDIAMTX_API_PORT),
      remoteMediaMtxUrl: env.REMOTE_MEDIAMTX_URL,
      recordingsDirectory: env.MEDIAMTX_RECORDINGS_DIR,
      screenshotsDirectory: env.MEDIAMTX_SCREENSHOTS_DIR,
    },
  })

  logger.info('Created config:', { config })
  logger.info('Database seeded successfully!')
}

main()
  .catch((e) => {
    logger.error('Error seeding database:', e)
    // Using process.exit is necessary here for the seed script
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
