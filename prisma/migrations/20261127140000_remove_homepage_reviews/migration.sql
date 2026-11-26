-- Fitur ulasan dihapus total: section Reviews di homepage dan modul
-- "Ulasan Pelanggan" di admin tidak ada lagi. Tabel ulasan di-drop, baris
-- section homepage-nya dihapus supaya kartunya hilang dari admin, dan semua
-- ContentBlock microcopy khusus reviews dibersihkan. Idempoten, aman
-- dijalankan ulang.

DROP TABLE IF EXISTS "HomepageReview";

DELETE FROM "HomepageSection" WHERE "key" = 'reviews';

DELETE FROM "ContentBlock" WHERE "key" LIKE 'home.reviews.%';
