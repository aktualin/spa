-- Kategori Journal pindah dari kolom teks bebas JournalPost.category ke tabel
-- sendiri dengan sortOrder, supaya urutannya bisa diatur admin dan salah ketik
-- tidak lagi membuat kategori baru.

-- CreateTable
CREATE TABLE "JournalCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalCategory_slug_key" ON "JournalCategory"("slug");

-- CreateIndex
CREATE INDEX "JournalCategory_sortOrder_idx" ON "JournalCategory"("sortOrder");

-- AlterTable
ALTER TABLE "JournalPost" ADD COLUMN "categoryId" TEXT;

-- Backfill: satu baris per nilai category yang sudah ada (case-insensitive),
-- urut abjad sebagai urutan awal. Slug dibuat dari nama; karakter selain
-- huruf/angka menjadi tanda hubung, lalu dipangkas.
INSERT INTO "JournalCategory" ("id", "slug", "name", "sortOrder", "updatedAt")
SELECT
    gen_random_uuid()::text,
    trim(both '-' from regexp_replace(lower(nama), '[^a-z0-9]+', '-', 'g')),
    nama,
    (row_number() OVER (ORDER BY lower(nama)) - 1)::int,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (lower(trim("category"))) trim("category") AS nama
    FROM "JournalPost"
    WHERE "category" IS NOT NULL AND trim("category") <> ''
    ORDER BY lower(trim("category")), "createdAt"
) AS sumber;

UPDATE "JournalPost" AS p
SET "categoryId" = c."id"
FROM "JournalCategory" AS c
WHERE p."category" IS NOT NULL
  AND lower(trim(p."category")) = lower(c."name");

-- AlterTable: kolom teks lama tidak lagi dipakai.
ALTER TABLE "JournalPost" DROP COLUMN "category";

-- CreateIndex
CREATE INDEX "JournalPost_categoryId_idx" ON "JournalPost"("categoryId");

-- AddForeignKey
ALTER TABLE "JournalPost" ADD CONSTRAINT "JournalPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "JournalCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
