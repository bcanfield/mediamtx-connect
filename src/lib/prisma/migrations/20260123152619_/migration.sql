-- CreateTable
CREATE TABLE "BackupConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TEXT NOT NULL DEFAULT '0 2 * * *',
    "localBackupDir" TEXT NOT NULL DEFAULT './backups',
    "maxLocalBackups" INTEGER NOT NULL DEFAULT 7,
    "remoteEnabled" BOOLEAN NOT NULL DEFAULT false,
    "remoteType" TEXT,
    "remoteBucket" TEXT,
    "remoteRegion" TEXT,
    "remoteAccessKey" TEXT,
    "remoteSecretKey" TEXT,
    "remotePrefix" TEXT DEFAULT 'backups/',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BackupHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "localPath" TEXT,
    "remotePath" TEXT,
    "sizeBytes" INTEGER,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RetentionConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TEXT NOT NULL DEFAULT '0 3 * * *',
    "maxAgeDays" INTEGER NOT NULL DEFAULT 30,
    "maxStoragePercent" INTEGER NOT NULL DEFAULT 90,
    "minFreeSpaceGB" REAL NOT NULL DEFAULT 10.0,
    "deleteOldestFirst" BOOLEAN NOT NULL DEFAULT true,
    "perStreamRetentionDays" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CleanupHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggerType" TEXT NOT NULL,
    "filesDeleted" INTEGER NOT NULL DEFAULT 0,
    "bytesFreed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "deletedFiles" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
