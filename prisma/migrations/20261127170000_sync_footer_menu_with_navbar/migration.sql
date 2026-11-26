-- Kolom footer disamakan dengan navbar: Services = isi dropdown Service
-- Menu, Corporate = isi dropdown Corporate Wellness, About = item top-level
-- navbar + Contact. Kolom Community dihapus dan semua tautan membership
-- (Loyalty Member/Membership) serta Partnership mailto tidak lagi jadi item
-- kolom (email kolaborasi tetap pada baris bawah footer). Menu bersifat
-- beku (tanpa modul admin), jadi baris FOOTER disinkron ulang menyeluruh.
-- Dijaga supaya TIDAK menyentuh database yang tabel MenuItem-nya masih
-- kosong (seed awal tetap berwenang mengisi penuh). Idempoten.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "MenuItem"
    WHERE locations @> ARRAY['FOOTER']::"MenuLocation"[]
  ) THEN
    DELETE FROM "MenuItem"
    WHERE locations @> ARRAY['FOOTER']::"MenuLocation"[];

    INSERT INTO "MenuItem"
      (id, label, "linkType", url, "sortOrder", locations, "parentId")
    VALUES
      -- Grup (level 1); sortOrder melanjutkan urutan item header (4..6).
      ('footer-services',  'Services',  'NO_LINK'::"MenuLinkType", NULL, 4, ARRAY['FOOTER']::"MenuLocation"[], NULL),
      ('footer-corporate', 'Corporate', 'NO_LINK'::"MenuLinkType", NULL, 5, ARRAY['FOOTER']::"MenuLocation"[], NULL),
      ('footer-about',     'About',     'NO_LINK'::"MenuLinkType", NULL, 6, ARRAY['FOOTER']::"MenuLocation"[], NULL),
      -- Services = kolom dropdown Service Menu (tanpa Loyalty Member).
      ('footer-services-0', 'Body Massage',         'ANCHOR'::"MenuLinkType", '/menu#massage',   0, ARRAY['FOOTER']::"MenuLocation"[], 'footer-services'),
      ('footer-services-1', 'Chair Services',       'ANCHOR'::"MenuLinkType", '/menu#massage',   1, ARRAY['FOOTER']::"MenuLocation"[], 'footer-services'),
      ('footer-services-2', 'Add Ons',              'ANCHOR'::"MenuLinkType", '/menu#body',      2, ARRAY['FOOTER']::"MenuLocation"[], 'footer-services'),
      ('footer-services-3', 'All Day Spa Packages', 'ANCHOR'::"MenuLinkType", '/menu#packages',  3, ARRAY['FOOTER']::"MenuLocation"[], 'footer-services'),
      -- Corporate = kolom dropdown Corporate Wellness (tanpa Partnership).
      ('footer-corporate-0', 'Corporate Wellness', 'INTERNAL_URL'::"MenuLinkType", '/corporate',            0, ARRAY['FOOTER']::"MenuLocation"[], 'footer-corporate'),
      ('footer-corporate-1', 'In-Office Program',  'ANCHOR'::"MenuLinkType",       '/corporate#in-office',  1, ARRAY['FOOTER']::"MenuLocation"[], 'footer-corporate'),
      ('footer-corporate-2', 'In-Spa Experience',  'ANCHOR'::"MenuLinkType",       '/corporate#in-spa',     2, ARRAY['FOOTER']::"MenuLocation"[], 'footer-corporate'),
      ('footer-corporate-3', 'Wellness Benefits',  'ANCHOR'::"MenuLinkType",       '/corporate#benefits',   3, ARRAY['FOOTER']::"MenuLocation"[], 'footer-corporate'),
      -- About = item top-level navbar + Contact.
      ('footer-about-0', 'Our Story', 'INTERNAL_URL'::"MenuLinkType", '/our-story', 0, ARRAY['FOOTER']::"MenuLocation"[], 'footer-about'),
      ('footer-about-1', 'Gallery',   'INTERNAL_URL'::"MenuLinkType", '/gallery',   1, ARRAY['FOOTER']::"MenuLocation"[], 'footer-about'),
      ('footer-about-2', 'Contact',   'INTERNAL_URL'::"MenuLinkType", '/contact',   2, ARRAY['FOOTER']::"MenuLocation"[], 'footer-about');
  END IF;
END $$;
