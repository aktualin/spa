-- Modul 23: Pencatatan Tamu — tabel data utama tamu + atribut key-value.
-- Salinan kualifikasi-schema ada di supabase/migrations/20261115072259_guest_management.sql.

-- CreateTable
CREATE TABLE "guests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" TEXT,
    "umur" INTEGER,
    "jenis_kelamin" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guest_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "guest_attributes_pkey" PRIMARY KEY ("id")
);

-- CHECK jenis_kelamin: hanya tiga nilai yang diizinkan (atau NULL).
ALTER TABLE "guests" ADD CONSTRAINT "guests_jenis_kelamin_check"
    CHECK ("jenis_kelamin" IS NULL OR "jenis_kelamin" IN ('Laki-laki', 'Perempuan', 'Lainnya'));

-- CreateIndex
CREATE INDEX "guests_created_at_idx" ON "guests"("created_at");

-- CreateIndex (satu key hanya boleh muncul sekali per tamu)
CREATE UNIQUE INDEX "guest_attributes_guest_id_key_key" ON "guest_attributes"("guest_id", "key");

-- AddForeignKey
ALTER TABLE "guest_attributes" ADD CONSTRAINT "guest_attributes_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- updated_at otomatis untuk tulisan langsung ke DB (update lewat aplikasi
-- sudah ditangani Prisma @updatedAt).
CREATE FUNCTION "set_guests_updated_at"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updated_at" = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "guests_updated_at"
    BEFORE UPDATE ON "guests"
    FOR EACH ROW
    EXECUTE FUNCTION "set_guests_updated_at"();
