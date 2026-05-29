-- CreateTable
CREATE TABLE "Cast" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "memo" TEXT,
    "pokeparaUrl" TEXT,
    "chocolatUrl" TEXT,
    "nightstyleUrl" TEXT,
    "caba2Url" TEXT,
    "pokeparaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "chocolatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nightstyleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "caba2Enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "castId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "startTime" TEXT,
    "endTime" TEXT,
    "comment" TEXT,
    "updatePokepara" BOOLEAN NOT NULL DEFAULT true,
    "updateChocolat" BOOLEAN NOT NULL DEFAULT true,
    "updateNightstyle" BOOLEAN NOT NULL DEFAULT true,
    "updateCaba2" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateLog" (
    "id" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "site" TEXT NOT NULL,
    "castId" TEXT NOT NULL,
    "castName" TEXT NOT NULL,
    "targetDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "comment" TEXT,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "screenshotPath" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_castId_date_key" ON "AttendanceRecord"("castId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_site_key" ON "SiteSettings"("site");

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Cast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
