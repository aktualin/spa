-- CreateTable
CREATE TABLE "MembershipProgram" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "priceHeadline" TEXT NOT NULL,
    "bannerBody" TEXT NOT NULL,
    "benefits" JSONB NOT NULL,
    "servicesIntro" TEXT NOT NULL,
    "services" JSONB NOT NULL,
    "termsHtml" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipProgram_pkey" PRIMARY KEY ("id")
);

