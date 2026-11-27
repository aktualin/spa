-- Section "menu book gallery" (#gallery di /menu) dihapus: card "KAMA Spa Menu
-- Gallery 2026" beserta deskripsinya tidak lagi dirender di halaman manapun.
-- Baris copy key-nya dibuang supaya ikut hilang dari editor Teks Halaman admin.
-- Kolom SiteSettings.menuScanUrls/menuPdfUrl DIPERTAHANKAN (non-destruktif),
-- hanya tidak lagi dibaca/ditulis aplikasi. Idempoten, aman dijalankan ulang.

DELETE FROM "ContentBlock" WHERE "key" IN (
  'menu.menu_book.eyebrow',
  'menu.menu_book.title',
  'menu.menu_book.description',
  'menu.menu_book.download_label',
  'menu.scan_alt',
  'menu.scan_aria'
);
