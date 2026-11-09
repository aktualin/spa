-- CreateEnum
CREATE TYPE "HeroSlideMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "mediaType" "HeroSlideMediaType" NOT NULL DEFAULT 'IMAGE',
    "imageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "videoUrl" TEXT,
    "imageAlt" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_isPublished_sortOrder_idx" ON "HeroSlide"("isPublished", "sortOrder");

-- Slide awal: video loop ringan hasil konversi GIF + tiga foto lanskap.
INSERT INTO "HeroSlide"
  ("id", "mediaType", "imageUrl", "mobileImageUrl", "videoUrl", "imageAlt", "isPublished", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('hero-slide-incense-video', 'VIDEO', '/img/kama/incense-smoke-poster.jpg', NULL, '/video/incense-smoke.mp4', NULL, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('hero-slide-incense', 'IMAGE', '/img/kama/01-incense.jpg', NULL, NULL, NULL, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('hero-slide-bottle-shadows', 'IMAGE', '/img/kama/02-bottle-shadows.jpg', NULL, NULL, NULL, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('hero-slide-water-drop', 'IMAGE', '/img/kama/08-water-drop.jpg', NULL, NULL, NULL, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Fallback hero lama memakai GIF 27,9 MB; ganti dengan poster ringan.
UPDATE "HomepageSection"
SET "imageUrl" = '/img/kama/incense-smoke-poster.jpg',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'hero'
  AND "imageUrl" = '/img/kama/incense_smoke_animated.gif';
