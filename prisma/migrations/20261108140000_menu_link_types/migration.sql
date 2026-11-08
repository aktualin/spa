
-- CreateEnum
CREATE TYPE "MenuLinkType" AS ENUM ('PAGE', 'INTERNAL_URL', 'EXTERNAL_URL', 'ANCHOR', 'NO_LINK');

-- CreateEnum
CREATE TYPE "MenuLocation" AS ENUM ('HEADER', 'FOOTER', 'MOBILE');

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "linkType" "MenuLinkType" NOT NULL DEFAULT 'INTERNAL_URL',
ADD COLUMN     "locations" "MenuLocation"[] DEFAULT ARRAY['HEADER', 'MOBILE']::"MenuLocation"[],
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "panelKey" TEXT,
ADD COLUMN     "panelLinkLabel" TEXT,
ALTER COLUMN "url" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "StaticPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

