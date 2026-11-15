-- ---------------------------------------------------------------------------
-- Modul 23: Pencatatan Tamu (Guest Management) — kamaspa.id
--
-- Dua tabel baru di schema "kama" (DATABASE_SCHEMA):
--   1. guests            — data utama tamu
--   2. guest_attributes  — atribut tambahan berpola key-value
--
-- File ini adalah salinan berkualifikasi-schema dari
-- prisma/migrations/20261115072259_guest_management/migration.sql (identik,
-- hanya ditambah prefix "kama".). Migration ini sudah diterapkan ke database
-- Supabase lewat `prisma migrate deploy` — JANGAN jalankan ulang manual kecuali
-- di lingkungan baru yang belum pernah di-migrate.
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS "kama";

-- 1. guests — data utama tamu -----------------------------------------------
CREATE TABLE "kama"."guests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nama" TEXT,
    "umur" INTEGER,
    "jenis_kelamin" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "guests_jenis_kelamin_check"
        CHECK ("jenis_kelamin" IS NULL OR "jenis_kelamin" IN ('Laki-laki', 'Perempuan', 'Lainnya'))
);

CREATE INDEX "guests_created_at_idx" ON "kama"."guests"("created_at");

-- 2. guest_attributes — atribut tambahan key-value ---------------------------
CREATE TABLE "kama"."guest_attributes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "guest_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "guest_attributes_guest_id_fkey"
        FOREIGN KEY ("guest_id") REFERENCES "kama"."guests"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Satu key hanya boleh muncul sekali per tamu.
CREATE UNIQUE INDEX "guest_attributes_guest_id_key_key" ON "kama"."guest_attributes"("guest_id", "key");

-- updated_at otomatis untuk tulisan langsung ke DB (update lewat aplikasi
-- sudah ditangani Prisma @updatedAt).
CREATE FUNCTION "kama"."set_guests_updated_at"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updated_at" = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "guests_updated_at"
    BEFORE UPDATE ON "kama"."guests"
    FOR EACH ROW
    EXECUTE FUNCTION "kama"."set_guests_updated_at"();
