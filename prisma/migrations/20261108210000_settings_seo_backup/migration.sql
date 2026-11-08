-- CreateEnum
CREATE TYPE "BackupKind" AS ENUM ('MANUAL', 'AUTO', 'HANDOVER');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "defaultOgImageUrl" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "ga4MeasurementId" TEXT,
ADD COLUMN     "gscVerification" TEXT,
ADD COLUMN     "instagramUsername" TEXT;

-- CreateTable
CREATE TABLE "BackupRun" (
    "id" TEXT NOT NULL,
    "kind" "BackupKind" NOT NULL,
    "status" "BackupStatus" NOT NULL,
    "format" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "location" TEXT,
    "note" TEXT,
    "triggeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupRun_createdAt_idx" ON "BackupRun"("createdAt");

-- AddForeignKey
ALTER TABLE "BackupRun" ADD CONSTRAINT "BackupRun_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

