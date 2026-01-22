-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediaMtxUrl" TEXT NOT NULL DEFAULT 'http://mediamtx',
    "mediaMtxApiPort" INTEGER NOT NULL DEFAULT 9997,
    "remoteMediaMtxUrl" TEXT DEFAULT 'http://localhost',
    "recordingsDirectory" TEXT NOT NULL DEFAULT '/recordings',
    "screenshotsDirectory" TEXT NOT NULL DEFAULT '/screenshots',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Config" ("createdAt", "id", "mediaMtxApiPort", "mediaMtxUrl", "recordingsDirectory", "remoteMediaMtxUrl", "screenshotsDirectory", "updatedAt") SELECT "createdAt", "id", "mediaMtxApiPort", "mediaMtxUrl", "recordingsDirectory", "remoteMediaMtxUrl", "screenshotsDirectory", "updatedAt" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
