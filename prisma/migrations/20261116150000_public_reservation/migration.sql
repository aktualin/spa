-- Halaman reservasi publik (/reservation): kolom jadwal + layanan pada
-- ReservationRequest, item menu header "Reservation", CTA kartu putih hero &
-- tombol Book Now header diarahkan ke /reservation, dan label form baru.
-- Data seed statis (src/data/content, scripts/seed-content.mts) sudah memuat
-- nilai yang sama; migrasi ini menyesuaikan database yang sudah terisi.
-- Idempoten.

-- 1) Kolom baru permintaan reservasi.
ALTER TABLE "ReservationRequest" ADD COLUMN "preferredDate" TEXT;
ALTER TABLE "ReservationRequest" ADD COLUMN "preferredTime" TEXT;
ALTER TABLE "ReservationRequest" ADD COLUMN "treatment" TEXT;
ALTER TABLE "ReservationRequest" ADD COLUMN "guests" INTEGER;

-- 2) Menu header + drawer mobile: "Reservation" setelah Contact, tepat
--    sebelum Service Menu (item eksternal terakhir).
DO $$
DECLARE
  pos int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "MenuItem"
    WHERE "parentId" IS NULL AND url = '/reservation' AND 'HEADER' = ANY("locations")
  ) THEN
    SELECT COALESCE(
      -- Service Menu = satu-satunya item header openInNew; sisip di posisinya.
      (SELECT "sortOrder" FROM "MenuItem"
       WHERE "parentId" IS NULL AND "openInNew" AND 'HEADER' = ANY("locations")
       ORDER BY "sortOrder" DESC LIMIT 1),
      -- Cadangan: tepat setelah Contact.
      (SELECT "sortOrder" + 1 FROM "MenuItem"
       WHERE "parentId" IS NULL AND url = '/contact' AND 'HEADER' = ANY("locations")
       ORDER BY "sortOrder" LIMIT 1),
      -- Cadangan terakhir: sortOrder tertinggi + 1.
      (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "MenuItem" WHERE "parentId" IS NULL)
    ) INTO pos;

    UPDATE "MenuItem"
    SET "sortOrder" = "sortOrder" + 1, "updatedAt" = now()
    WHERE "parentId" IS NULL AND 'HEADER' = ANY("locations") AND "sortOrder" >= pos;

    INSERT INTO "MenuItem"
      ("id", "label", "linkType", "url", "sortOrder", "isVisible", "openInNew",
       "locations", "createdAt", "updatedAt")
    VALUES
      ('menu-reservation-header', 'Reservation', 'INTERNAL_URL', '/reservation', pos, true, false,
       ARRAY['HEADER', 'MOBILE']::"MenuLocation"[], now(), now());
  END IF;
END $$;

-- 3) CTA kartu putih hero ("Book Now") menuju halaman reservasi; hanya sentuh
--    nilai bawaan lama (/contact) atau yang masih kosong — suntingan admin
--    yang disengaja tidak ditimpa.
UPDATE "HomepageSection"
SET "ctaHref" = '/reservation'
WHERE "key" = 'hero' AND COALESCE("ctaHref", '') IN ('', '/contact');

-- 4) Tombol Book Now di header (Kontak & Umum) mengikuti tujuan yang sama.
UPDATE "SiteSettings"
SET "bookNowHref" = '/reservation'
WHERE COALESCE("bookNowHref", '') IN ('', '/contact');

-- 5) Label form reservasi baru (ContentBlock grup "forms") + label pesan lama
--    "Treatment yang diminati" menjadi catatan bebas karena treatment kini
--    punya select sendiri. Hanya nilai seed lama yang diganti.
INSERT INTO "ContentBlock" ("key", "group", "value", "updatedAt") VALUES
  ('forms.reservation.treatment_label', 'forms', 'Pilih jenis treatment', now()),
  ('forms.reservation.date_label', 'forms', 'Tanggal', now()),
  ('forms.reservation.time_label', 'forms', 'Jam', now()),
  ('forms.reservation.guests_label', 'forms', 'Jumlah orang', now())
ON CONFLICT ("key") DO NOTHING;

UPDATE "ContentBlock"
SET "value" = 'Catatan tambahan (opsional)', "updatedAt" = now()
WHERE "key" = 'forms.reservation.message_label'
  AND "value" = 'Treatment yang diminati';
