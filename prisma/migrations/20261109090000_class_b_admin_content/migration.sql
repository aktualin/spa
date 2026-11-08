-- AlterTable
ALTER TABLE "CorporateClient" ADD COLUMN     "description" TEXT,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "MembershipProgram" ADD COLUMN     "bannerCtaHref" TEXT,
ADD COLUMN     "bannerCtaLabel" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "highlightHref" TEXT,
ADD COLUMN     "highlightImageUrl" TEXT,
ADD COLUMN     "highlightLabel" TEXT,
ADD COLUMN     "panelWidth" INTEGER;

-- AlterTable
ALTER TABLE "RetailProduct" ADD COLUMN     "isCollaboration" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "bookNowHref" TEXT,
ADD COLUMN     "bookNowLabel" TEXT,
ADD COLUMN     "footerTagline" TEXT,
ADD COLUMN     "menuPdfUrl" TEXT,
ADD COLUMN     "menuScanUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "priceDisclaimer" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "tag" TEXT,
    "address" TEXT,
    "openingHours" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whatsappNumber" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "mapsEmbedUrl" TEXT,
    "mapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_slug_key" ON "Branch"("slug");

