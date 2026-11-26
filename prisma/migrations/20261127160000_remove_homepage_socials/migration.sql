-- Section "socials" dihapus dari homepage: baris header (@username, #hashtag,
-- tombol Follow Us) beserta card embed postingan Instagram tidak lagi
-- dirender. Baris section-nya dibuang supaya kartunya ikut hilang dari
-- manajemen homepage admin. Modul admin "Feed Instagram", tabel InstagramPost,
-- dan copy key global.instagram_* DIPERTAHANKAN (masih dipakai modul admin dan
-- section gallery-teaser). Idempoten, aman dijalankan ulang.

DELETE FROM "HomepageSection" WHERE "key" = 'socials';
