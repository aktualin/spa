-- Feed Instagram beralih dari foto unggahan ke embed postingan asli:
-- satu baris = satu URL postingan Instagram (p/reel/tv).
ALTER TABLE "InstagramPost" ADD COLUMN "postUrl" TEXT NOT NULL DEFAULT '';

-- Pertahankan baris yang tautan postingannya memang URL postingan Instagram.
UPDATE "InstagramPost" SET "postUrl" = "href"
WHERE "href" ~ '^https?://(www\.)?instagram\.com/(p|reel|reels|tv)/[A-Za-z0-9_-]+';

-- Sisanya (hanya foto unggahan) tidak terpakai lagi.
DELETE FROM "InstagramPost" WHERE "postUrl" = '';

ALTER TABLE "InstagramPost" ALTER COLUMN "postUrl" DROP DEFAULT;
ALTER TABLE "InstagramPost" DROP COLUMN "imageUrl";
ALTER TABLE "InstagramPost" DROP COLUMN "imageAlt";
ALTER TABLE "InstagramPost" DROP COLUMN "href";
