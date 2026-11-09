-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN     "eyebrow" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "footerMembershipJoinLabel" TEXT,
ADD COLUMN     "footerMembershipLearnLabel" TEXT,
ADD COLUMN     "footerMembershipTitle" TEXT,
ADD COLUMN     "partnershipEmail" TEXT,
ADD COLUMN     "partnershipIntro" TEXT;

-- CreateTable
CREATE TABLE "ContentBlock" (
    "key" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "ContentBlock_group_idx" ON "ContentBlock"("group");
