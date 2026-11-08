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
  corporate: "content:corporate", // CorporateContent, CorporateProgram, CorporateStep, CorporateClient (BUKAN CorporateInquiry — PII)
  homepage: "content:homepage", // HomepageSection, HomepageHighlight
  ourStory: "content:our-story", // OurStoryContent
  menu: "content:menu", // MenuItem
  branches: "content:branches", // Branch
  settings: "content:settings", // SiteSettings, WhatsAppTemplate
  seo: "content:seo", // PageSeo
  pages: "content:pages", // StaticPage
  // Redirect dibaca proxy lewat cache memori ber-TTL (src/lib/redirects.ts),
  // bukan "use cache"; tag ini untuk bacaan halaman admin/sitemap saja.
  redirects: "content:redirects", // Redirect
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];
