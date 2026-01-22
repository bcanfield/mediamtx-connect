import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Delete existing config to ensure clean state
  await prisma.config.deleteMany();

  // Create development configuration
  const config = await prisma.config.create({
    data: {
      mediaMtxUrl: process.env.MEDIAMTX_URL || "http://localhost",
      mediaMtxApiPort: parseInt(process.env.MEDIAMTX_API_PORT || "9997"),
      remoteMediaMtxUrl: process.env.REMOTE_MEDIAMTX_URL || "http://localhost",
      recordingsDirectory: process.env.RECORDINGS_DIR || "./test-data/recordings",
      screenshotsDirectory: process.env.SCREENSHOTS_DIR || "./test-data/screenshots",
    },
  });

  console.log("Created config:", config);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
