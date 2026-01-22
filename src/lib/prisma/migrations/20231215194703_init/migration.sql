-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediaMtxUrl" TEXT NOT NULL,
    "mediaMtxApiPort" INTEGER NOT NULL,
    "remoteMediaMtxUrl" TEXT NOT NULL,
    "recordingsDirectory" TEXT NOT NULL,
    "screenshotsDirectory" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
