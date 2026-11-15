-- Feed Instagram kini embed postingan; pesan feed kosong lama masih menyebut "foto".
UPDATE "ContentBlock"
SET "value" = 'Belum ada postingan Instagram. Tambahkan tautan postingan dari admin, modul Homepage → Feed Instagram.'
WHERE "key" IN ('global.instagram_empty', 'home.socials.empty')
  AND "value" LIKE '%foto Instagram%';
