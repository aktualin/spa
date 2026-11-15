-- Tautan /gallery di menu publik: header (desktop + drawer mobile) di antara
-- Corporate Wellness dan Contact, serta footer grup About (anak terakhir).
-- Data seed statis (src/data/content) sudah memuat item yang sama; migrasi ini
-- menambahkan barisnya ke database yang sudah terisi. Idempoten.

DO $$
DECLARE
  about_id text;
BEGIN
  -- 1) Header + mobile: geser Contact/Service Menu, sisip Gallery di urutan 2.
  IF NOT EXISTS (
    SELECT 1 FROM "MenuItem"
    WHERE "parentId" IS NULL AND url = '/gallery' AND 'HEADER' = ANY("locations")
  ) THEN
    UPDATE "MenuItem"
    SET "sortOrder" = "sortOrder" + 1, "updatedAt" = now()
    WHERE "parentId" IS NULL AND 'HEADER' = ANY("locations") AND "sortOrder" >= 2;

    INSERT INTO "MenuItem"
      ("id", "label", "linkType", "url", "sortOrder", "isVisible", "openInNew",
       "locations", "createdAt", "updatedAt")
    VALUES
      ('menu-gallery-header', 'Gallery', 'INTERNAL_URL', '/gallery', 2, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], now(), now());
  END IF;

  -- 2) Footer: anak terakhir grup About.
  SELECT "id" INTO about_id
  FROM "MenuItem"
  WHERE "parentId" IS NULL AND label = 'About' AND 'FOOTER' = ANY("locations")
  LIMIT 1;

  IF about_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "MenuItem" WHERE "parentId" = about_id AND url = '/gallery'
  ) THEN
    INSERT INTO "MenuItem"
      ("id", "label", "linkType", "url", "sortOrder", "isVisible", "openInNew",
       "locations", "parentId", "createdAt", "updatedAt")
    VALUES
      ('menu-gallery-footer', 'Gallery', 'INTERNAL_URL', '/gallery',
       (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "MenuItem" WHERE "parentId" = about_id),
       true, false, ARRAY['FOOTER']::"MenuLocation"[], about_id, now(), now());
  END IF;
END $$;
