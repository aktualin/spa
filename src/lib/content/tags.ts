/**
 * Tag cache konten publik.
 *
 * Bacaan publik (`src/lib/content/*`) memakai `"use cache"` + `cacheTag(tag)`.
 * Server Action admin yang menulis ke tabel terkait wajib memanggil
 * `updateTag(tag)` supaya halaman publik langsung menampilkan perubahan.
 */
export const CONTENT_TAGS = {
  catalog: "content:catalog", // TreatmentCategory, Treatment, TreatmentOption, Package, PackageItem
  gallery: "content:gallery", // GalleryAlbum, GalleryPhoto
  promos: "content:promos", // Promo
  giftCard: "content:gift-card", // GiftCardInfo
  membership: "content:membership", // MembershipTier
  journal: "content:journal", // JournalPost
  events: "content:events", // EventItem, EventPhoto
  retail: "content:retail", // RetailProduct
  corporate: "content:corporate", // CorporateContent (BUKAN CorporateInquiry — PII)
  homepage: "content:homepage", // HomepageSection
  ourStory: "content:our-story", // OurStoryContent
  menu: "content:menu", // MenuItem
  settings: "content:settings", // SiteSettings, WhatsAppTemplate
  seo: "content:seo", // PageSeo
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];
