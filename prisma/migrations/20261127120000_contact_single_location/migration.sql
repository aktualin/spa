-- Halaman /contact kini menampilkan satu lokasi saja (cabang pertama dalam
-- urutan admin), jadi judul section menjadi tunggal. Copy beku (tanpa editor
-- admin) → upsert by key: nilai lama diperbarui dan DB yang belum punya kunci
-- ini mendapatkannya sekaligus. Idempoten, aman dijalankan ulang.

INSERT INTO "ContentBlock" ("key", "group", "value", "updatedAt")
VALUES ('contact.locations.title', 'contact', 'Our Location', now())
ON CONFLICT ("key") DO UPDATE
SET "value" = EXCLUDED."value", "updatedAt" = now();
