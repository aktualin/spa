-- Brief 05 "Footer, social & collaboration contact":
-- 1. Kolom SiteSettings.officeWhatsappNumber — nomor WhatsApp kantor yang tampil
--    di footer "Connect With Us" (TERPISAH dari whatsappNumber/nomor booking).
-- 2. Template WhatsApp konteks "office" untuk pesan pembuka link kantor.
-- 3. Konsolidasi email publik hello@kamaspa.id -> marketing@kamaspa.id
--    (SiteSettings.email + kalimat kontak di halaman legal).
-- Idempoten; DB kosong diserahkan ke scripts/seed.mts (fill-only-when-empty).

-- 1) Kolom baru (re-run safe; IF NOT EXISTS deviasi gaya yang disengaja).
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "officeWhatsappNumber" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "SiteSettings" WHERE "id" = 'singleton') THEN
    RETURN; -- DB kosong: data awal milik scripts/seed.mts
  END IF;

  -- 2) Backfill nomor kantor HANYA bila kosong — suntingan admin tak pernah
  --    ditimpa (pola backfill 20261116150000_public_reservation).
  UPDATE "SiteSettings"
  SET "officeWhatsappNumber" = '6281188072287'
  WHERE "id" = 'singleton' AND COALESCE("officeWhatsappNumber", '') = '';

  -- 3) Template konteks "office" — label & message identik dengan registry di
  --    src/lib/domain/whatsapp-template.contexts-extra.ts. id literal karena
  --    @default(cuid()) hanya berlaku client-side; updatedAt NOT NULL tanpa default.
  INSERT INTO "WhatsAppTemplate" ("id", "key", "label", "message", "updatedAt")
  VALUES ('wa-template-office', 'office', 'WhatsApp kantor',
          $q$Hi KAMA, I'd like to speak with the office team$q$, now())
  ON CONFLICT ("key") DO NOTHING;

  -- 4) Email publik terverifikasi — guard nilai lama persis (permukaan
  --    admin-editable; suntingan admin lain tidak ditimpa).
  UPDATE "SiteSettings"
  SET "email" = 'marketing@kamaspa.id'
  WHERE "id" = 'singleton' AND "email" = 'hello@kamaspa.id';

  -- 5) Halaman legal: ganti substring email saja (idempoten; edit admin lain
  --    pada bodyHtml tidak tersentuh).
  UPDATE "StaticPage"
  SET "bodyHtml" = REPLACE("bodyHtml", 'hello@kamaspa.id', 'marketing@kamaspa.id')
  WHERE "slug" IN ('privacy-policy', 'terms-conditions')
    AND "bodyHtml" LIKE '%hello@kamaspa.id%';
END $$;
