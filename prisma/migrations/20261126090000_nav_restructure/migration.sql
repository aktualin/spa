-- Restrukturisasi menu header sesuai IA kontrak:
--   Our Story · Service Menu (dropdown 5 tautan) · Gallery · Corporate Wellness.
-- Contact / Reservation / PDF Drive eksternal dihapus dari HEADER (footer tidak
-- disentuh). CTA Book Now tetap /reservation. Dropdown Service Menu memakai
-- panelKey 'services' yang sama sehingga id DOM panel tidak berubah.
-- Seed statis (src/data/content/nav*.ts) sudah memuat bentuk yang sama; migrasi
-- ini menyamakan database yang sudah terisi. Idempoten; DB kosong diserahkan ke
-- scripts/seed.mts (seedMenu hanya mengisi tabel kosong).

DO $$
DECLARE
  services_id  text;
  corporate_id text;
  gallery_id   text;
  ourstory_id  text;
BEGIN
  -- 0) Jangan sentuh DB kosong: satu insert di sini akan membuat seedMenu()
  --    (count() === 0) dilewati selamanya.
  IF NOT EXISTS (
    SELECT 1 FROM "MenuItem"
    WHERE "parentId" IS NULL AND 'HEADER' = ANY("locations")
  ) THEN
    RETURN;
  END IF;

  -- 1) Hapus akar header Contact / Reservation / PDF Drive (cascade ke anak).
  --    Footer aman: grup footer berlokasi FOOTER, bukan HEADER.
  DELETE FROM "MenuItem"
  WHERE "parentId" IS NULL AND 'HEADER' = ANY("locations")
    AND ("url" IN ('/contact', '/reservation')
         OR "url" LIKE 'https://drive.google.com/%');

  -- 2) Temukan akar berdasarkan panelKey/url (id seed = cuid, bukan key tetap).
  SELECT "id" INTO services_id FROM "MenuItem"
   WHERE "parentId" IS NULL AND "panelKey" = 'services'
     AND 'HEADER' = ANY("locations") LIMIT 1;
  SELECT "id" INTO corporate_id FROM "MenuItem"
   WHERE "parentId" IS NULL AND "panelKey" = 'corporate'
     AND 'HEADER' = ANY("locations") LIMIT 1;
  SELECT "id" INTO gallery_id FROM "MenuItem"
   WHERE "parentId" IS NULL AND "url" = '/gallery'
     AND 'HEADER' = ANY("locations") LIMIT 1;

  -- 3) Bangun ulang anak Service Menu: 1 kolom "Layanan" + 5 tautan berurutan.
  --    Guard: lewati bila bentuk baru sudah ada (DB yang di-seed ulang / re-run).
  IF services_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "MenuItem" c
    JOIN "MenuItem" l ON l."parentId" = c."id"
    WHERE c."parentId" = services_id
      AND l."label" = 'Loyalty Member' AND l."url" = '/membership'
  ) THEN
    DELETE FROM "MenuItem" WHERE "parentId" = services_id; -- cascade ke leaf

    INSERT INTO "MenuItem"
      ("id", "label", "linkType", "url", "sortOrder", "isVisible", "openInNew",
       "locations", "parentId", "createdAt", "updatedAt")
    VALUES
      ('menu-services-col-0', 'Layanan', 'NO_LINK', NULL, 0, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], services_id, now(), now());

    INSERT INTO "MenuItem"
      ("id", "label", "linkType", "url", "sortOrder", "isVisible", "openInNew",
       "locations", "parentId", "createdAt", "updatedAt")
    VALUES
      ('menu-services-link-0', 'Body Massage', 'ANCHOR', '/menu#massage', 0, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], 'menu-services-col-0', now(), now()),
      ('menu-services-link-1', 'Chair Services', 'ANCHOR', '/menu#massage', 1, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], 'menu-services-col-0', now(), now()),
      ('menu-services-link-2', 'Add Ons', 'ANCHOR', '/menu#body', 2, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], 'menu-services-col-0', now(), now()),
      ('menu-services-link-3', 'All Day Spa Packages', 'ANCHOR', '/menu#packages', 3, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], 'menu-services-col-0', now(), now()),
      ('menu-services-link-4', 'Loyalty Member', 'INTERNAL_URL', '/membership', 4, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], 'menu-services-col-0', now(), now());
  END IF;

  -- 4) Akar Service Menu: label, tipe & lebar panel. Highlight lama DIPERTAHANKAN
  --    (jangan hardcode URL aset S3 di SQL); panelLinkLabel diisi bila kosong.
  --    linkType WAJIB INTERNAL_URL: resolveMenuHref(NO_LINK) = null walau url
  --    diisi, sehingga href '/menu' hilang -> footerLink & state aktif rute anak
  --    (/menu/[slug]) rusak. Seed memakai INTERNAL_URL, jadi ini menyamakannya.
  IF services_id IS NOT NULL THEN
    UPDATE "MenuItem"
    SET "label" = 'Service Menu', "linkType" = 'INTERNAL_URL', "url" = '/menu',
        "openInNew" = false,
        "panelWidth" = NULL,  -- 1 kolom -> fallback 'narrow', sama dengan seed
        "panelLinkLabel" = COALESCE("panelLinkLabel", 'Lihat semua treatment'),
        "updatedAt" = now()
    WHERE "id" = services_id;
  END IF;

  -- 5) Our Story (header + drawer), guard NOT EXISTS.
  IF NOT EXISTS (
    SELECT 1 FROM "MenuItem"
    WHERE "parentId" IS NULL AND "url" = '/our-story' AND 'HEADER' = ANY("locations")
  ) THEN
    INSERT INTO "MenuItem"
      ("id", "label", "linkType", "url", "sortOrder", "isVisible", "openInNew",
       "locations", "createdAt", "updatedAt")
    VALUES
      ('menu-our-story-header', 'Our Story', 'INTERNAL_URL', '/our-story', 0, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], now(), now());
  END IF;
  SELECT "id" INTO ourstory_id FROM "MenuItem"
   WHERE "parentId" IS NULL AND "url" = '/our-story' AND 'HEADER' = ANY("locations")
   LIMIT 1;

  -- 6) Urutan tetap: Our Story 0, Service Menu 1, Gallery 2, Corporate 3.
  UPDATE "MenuItem" SET "sortOrder" = 0, "updatedAt" = now() WHERE "id" = ourstory_id;
  UPDATE "MenuItem" SET "sortOrder" = 1, "updatedAt" = now() WHERE "id" = services_id;
  UPDATE "MenuItem" SET "sortOrder" = 2, "updatedAt" = now() WHERE "id" = gallery_id;
  UPDATE "MenuItem" SET "sortOrder" = 3, "updatedAt" = now() WHERE "id" = corporate_id;

  -- Akar header tak terduga digeser ke belakang. COALESCE wajib: NOT IN dengan
  -- NULL tidak pernah true, jadi pakai <> ALL(ARRAY[...]).
  UPDATE "MenuItem" SET "sortOrder" = "sortOrder" + 4, "updatedAt" = now()
  WHERE "parentId" IS NULL AND 'HEADER' = ANY("locations") AND "sortOrder" < 4
    AND "id" <> ALL(ARRAY[COALESCE(ourstory_id, ''), COALESCE(services_id, ''),
                          COALESCE(gallery_id, ''), COALESCE(corporate_id, '')]);
END $$;

-- 7) CTA Book Now: hanya nilai bawaan lama/kosong yang diganti (suntingan admin
--    sengaja tidak ditimpa) — pola migrasi 20261116150000_public_reservation.
UPDATE "SiteSettings" SET "bookNowHref" = '/reservation'
WHERE COALESCE("bookNowHref", '') IN ('', '/contact');
UPDATE "SiteSettings" SET "bookNowLabel" = 'Book Now'
WHERE COALESCE("bookNowLabel", '') = '';