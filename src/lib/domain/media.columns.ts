/** Kolom database penyimpan URL gambar — lihat `media.ts`. */

/**
 * Kolom yang menyimpan URL gambar. Dipakai untuk menghitung "dipakai di" dan
 * untuk mengganti URL ketika berkas media diganti. Nama model = delegate Prisma.
 */
export const MEDIA_URL_COLUMNS = [
  { model: "treatmentCategory", field: "imageUrl", label: "Kategori treatment" },
  { model: "treatment", field: "imageUrl", label: "Treatment" },
  { model: "package", field: "imageUrl", label: "Package" },
  { model: "galleryAlbum", field: "coverUrl", label: "Sampul album" },
  { model: "galleryPhoto", field: "imageUrl", label: "Foto gallery" },
  { model: "promo", field: "bannerUrl", label: "Promo" },
  { model: "giftCardInfo", field: "imageUrl", label: "Gift card" },
  { model: "journalPost", field: "coverUrl", label: "Journal" },
  { model: "eventItem", field: "coverUrl", label: "Event" },
  { model: "eventPhoto", field: "imageUrl", label: "Foto event" },
  { model: "retailProduct", field: "imageUrl", label: "Produk retail" },
  { model: "homepageSection", field: "imageUrl", label: "Homepage" },
  { model: "homepageSection", field: "mobileImageUrl", label: "Homepage (mobile)" },
  { model: "ourStoryContent", field: "heroImageUrl", label: "Our Story" },
  { model: "pageSeo", field: "ogImageUrl", label: "Gambar SEO" },
  { model: "eventItem", field: "partnerLogoUrl", label: "Logo mitra event" },
  { model: "corporateProgram", field: "imageUrl", label: "Program corporate" },
  { model: "corporateClient", field: "logoUrl", label: "Logo klien corporate" },
  { model: "homepageHighlight", field: "imageUrl", label: "Highlight homepage" },
  { model: "instagramPost", field: "imageUrl", label: "Feed Instagram" },
  { model: "siteSettings", field: "faviconUrl", label: "Favicon" },
  { model: "siteSettings", field: "defaultOgImageUrl", label: "Gambar OG bawaan" },
  { model: "siteSettings", field: "menuPdfUrl", label: "PDF menu" },
  { model: "menuItem", field: "highlightImageUrl", label: "Kartu highlight menu" },
] as const;

/**
 * Kolom berisi DAFTAR URL gambar (Postgres text[]). Pemakaian dicek dengan
 * `has`, dan URL diganti dengan `array_replace` saat berkas media diganti.
 */
export const MEDIA_URL_ARRAY_COLUMNS = [
  { model: "corporateClient", table: "CorporateClient", field: "photoUrls", label: "Dokumentasi klien corporate" },
  { model: "siteSettings", table: "SiteSettings", field: "menuScanUrls", label: "Halaman scan menu" },
] as const;

export type MediaUrlColumn = (typeof MEDIA_URL_COLUMNS)[number];

/**
 * Kolom HTML (editor teks kaya) yang bisa memuat URL gambar di dalam isinya.
 * `table` = nama tabel Postgres (model Prisma tanpa @@map), dipakai untuk
 * `REPLACE` lewat SQL mentah ketika berkas media diganti.
 */
export const MEDIA_HTML_COLUMNS = [
  { table: "GiftCardInfo", model: "giftCardInfo", field: "bodyHtml", label: "Gift card (isi)" },
  { table: "JournalPost", model: "journalPost", field: "bodyHtml", label: "Journal (isi)" },
  { table: "CorporateContent", model: "corporateContent", field: "inOfficeHtml", label: "Corporate (in-office)" },
  { table: "CorporateContent", model: "corporateContent", field: "inSpaHtml", label: "Corporate (in-spa)" },
  { table: "CorporateContent", model: "corporateContent", field: "stepsHtml", label: "Corporate (langkah)" },
  { table: "HomepageSection", model: "homepageSection", field: "bodyHtml", label: "Homepage (isi)" },
  { table: "OurStoryContent", model: "ourStoryContent", field: "philosophyHtml", label: "Our Story (filosofi)" },
  { table: "OurStoryContent", model: "ourStoryContent", field: "valuesHtml", label: "Our Story (nilai)" },
  { table: "StaticPage", model: "staticPage", field: "bodyHtml", label: "Halaman (isi)" },
] as const;

export type MediaHtmlColumn = (typeof MEDIA_HTML_COLUMNS)[number];