
-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('TREATMENT', 'ADDON');

-- CreateEnum
CREATE TYPE "AddonSection" AS ENUM ('BODY', 'FACE', 'HEAD_SCALP', 'BATH');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "durationLabel" TEXT,
ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quote" TEXT,
ADD COLUMN     "subtitle" TEXT;

-- AlterTable
ALTER TABLE "PackageItem" ADD COLUMN     "minutes" INTEGER;

-- AlterTable
ALTER TABLE "Treatment" ADD COLUMN     "addonSection" "AddonSection",
ADD COLUMN     "note" TEXT,
ADD COLUMN     "tagline" TEXT;

-- AlterTable
ALTER TABLE "TreatmentCategory" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kind" "CategoryKind" NOT NULL DEFAULT 'TREATMENT';

