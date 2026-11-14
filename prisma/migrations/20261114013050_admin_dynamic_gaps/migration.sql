-- AlterTable
ALTER TABLE "CorporateContent" ADD COLUMN     "aboutImageAlt" TEXT,
ADD COLUMN     "aboutImageUrl" TEXT,
ADD COLUMN     "heroImageAlt" TEXT,
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "inSpaImageAlt" TEXT,
ADD COLUMN     "inSpaImageUrl" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "highlightBadge" TEXT,
ADD COLUMN     "highlightEyebrow" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "brandLogoAlt" TEXT,
ADD COLUMN     "brandWordmarkBottom" TEXT,
ADD COLUMN     "brandWordmarkTop" TEXT,
ADD COLUMN     "footerMembershipLearnHref" TEXT,
ADD COLUMN     "footerPrivacyHref" TEXT,
ADD COLUMN     "footerTermsHref" TEXT,
ADD COLUMN     "logoLockupUrl" TEXT,
ADD COLUMN     "logoMarkDarkUrl" TEXT,
ADD COLUMN     "logoMarkLightUrl" TEXT,
ADD COLUMN     "seoDefaultDescription" TEXT,
ADD COLUMN     "seoDefaultTitle" TEXT,
ADD COLUMN     "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seoOgDescription" TEXT,
ADD COLUMN     "seoOgLocale" TEXT,
ADD COLUMN     "seoSiteName" TEXT,
ADD COLUMN     "seoTitleTemplate" TEXT;

-- CreateTable
CREATE TABLE "NewsletterSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "branchSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "branchSlug" TEXT,
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsletterSignup_createdAt_idx" ON "NewsletterSignup"("createdAt");

-- CreateIndex
CREATE INDEX "ReservationRequest_status_createdAt_idx" ON "ReservationRequest"("status", "createdAt");
