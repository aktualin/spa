/**
 * Registry tabel copy visitor untuk inventarisasi & migrasi English.
 * Hanya kolom copy — tanpa tabel PII (AdminUser, ReservationRequest,
 * CorporateInquiry, PageView, NewsletterSignup) dan tanpa modul admin
 * (BackupRun, MediaAsset, Redirect, InstagramPost = URL saja).
 * `slug` dipakai menyaring baris sisa e2e (`e2e-%`).
 */
export type InventoryTable = {
  table: string;
  identity: string[];
  copy: string[];
  arrays?: string[];
  json?: string[];
  slug?: boolean;
};

export const INVENTORY_TABLES: InventoryTable[] = [
  { table: "SiteSettings", identity: ["id"], copy: ["address", "priceDisclaimer", "footerTagline", "footerMembershipTitle", "footerMembershipLearnLabel", "footerMembershipJoinLabel", "partnershipIntro", "partnershipEmail", "bookNowLabel", "bookNowHref", "brandWordmarkTop", "brandWordmarkBottom", "brandLogoAlt", "seoSiteName", "seoDefaultTitle", "seoDefaultDescription", "seoOgDescription", "seoOgLocale", "seoTitleTemplate", "footerMembershipLearnHref", "footerPrivacyHref", "footerTermsHref"], arrays: ["openingHours", "seoKeywords"] },
  { table: "WhatsAppTemplate", identity: ["id", "key"], copy: ["label", "message"] },
  { table: "ContentBlock", identity: ["key"], copy: ["group", "value"] },
  { table: "MenuItem", identity: ["id", "parentId", "panelKey"], copy: ["label", "panelLinkLabel", "highlightLabel", "highlightBadge", "highlightEyebrow"] },
  { table: "HomepageSection", identity: ["id", "key"], copy: ["eyebrow", "title", "subtitle", "bodyHtml", "imageAlt", "ctaLabel"] },
  { table: "HomepageHighlight", identity: ["id"], copy: ["eyebrow", "title", "body", "imageAlt", "ctaLabel"] },
  { table: "HomepageStat", identity: ["id"], copy: ["value", "label"] },
  { table: "HeroSlide", identity: ["id"], copy: ["imageAlt"] },
  { table: "OurStoryContent", identity: ["id"], copy: ["heroTitle", "philosophyHtml", "valuesHtml", "seoTitle", "seoDescription"] },
  { table: "JournalCategory", identity: ["id", "slug"], copy: ["name"], slug: true },
  { table: "JournalPost", identity: ["id", "slug"], copy: ["title", "excerpt", "bodyHtml", "seoTitle", "seoDescription"], arrays: ["tags"], slug: true },
  { table: "GalleryAlbum", identity: ["id", "slug"], copy: ["name", "description"], slug: true },
  { table: "GalleryPhoto", identity: ["id", "albumId"], copy: ["caption", "altText"] },
  { table: "ContentImage", identity: ["id", "entityType", "entityId"], copy: ["altText"] },
  { table: "CorporateContent", identity: ["id"], copy: ["heroTitle", "intro", "inOfficeHtml", "inSpaHtml", "stepsHtml", "picName", "heroImageAlt", "aboutImageAlt", "inSpaImageAlt"], arrays: ["benefits", "inSpaItems"], json: ["solutions"] },
  { table: "CorporateProgram", identity: ["id"], copy: ["name", "description"], arrays: ["features"] },
  { table: "CorporateStep", identity: ["id"], copy: ["title", "body"] },
  { table: "CorporateClient", identity: ["id"], copy: ["name", "description"] },
  { table: "MembershipProgram", identity: ["id"], copy: ["eyebrow", "title", "intro", "priceHeadline", "bannerBody", "bannerCtaLabel", "servicesIntro", "termsHtml"], json: ["benefits", "services"] },
  { table: "MembershipTier", identity: ["id", "slug"], copy: ["name", "priceLabel", "billingNote", "summary", "terms"], arrays: ["benefits"], slug: true },
  { table: "Branch", identity: ["id", "slug"], copy: ["name", "area", "tag", "address"], arrays: ["openingHours"], slug: true },
  { table: "PageSeo", identity: ["id", "path"], copy: ["title", "description"] },
  { table: "Promo", identity: ["id", "slug"], copy: ["title", "description", "terms", "seoTitle", "seoDescription", "whatsappMessage"], slug: true },
  { table: "GiftCardInfo", identity: ["id"], copy: ["title", "subtitle", "bodyHtml", "termsHtml", "whatsappMessage"] },
  { table: "EventItem", identity: ["id", "slug"], copy: ["title", "description", "location", "partnerName", "seoTitle", "seoDescription"], slug: true },
  { table: "EventPhoto", identity: ["id", "eventId"], copy: ["caption"] },
  { table: "RetailProduct", identity: ["id", "slug"], copy: ["name", "description", "whatsappMessage"], slug: true },
  { table: "StaticPage", identity: ["id", "slug"], copy: ["title", "bodyHtml", "seoTitle", "seoDescription"], slug: true },
  { table: "TreatmentCategory", identity: ["id", "slug"], copy: ["name", "description", "seoTitle", "seoDescription"], slug: true },
  { table: "Treatment", identity: ["id", "slug"], copy: ["name", "tagline", "description", "note", "seoTitle", "seoDescription", "whatsappMessage"], slug: true },
  { table: "TreatmentOption", identity: ["id", "treatmentId"], copy: ["label"] },
  { table: "Package", identity: ["id", "slug"], copy: ["name", "subtitle", "quote", "description", "durationLabel", "seoTitle", "seoDescription", "whatsappMessage"], slug: true },
  { table: "PackageItem", identity: ["id", "packageId", "treatmentId"], copy: ["label"] },
];

/** Kolom yang tetap Indonesia/bahasa apa adanya: label admin & nama proper. */
export const KEEP_AS_IS: Record<string, string[]> = {
  WhatsAppTemplate: ["label"],
  ContentBlock: ["group"],
  CorporateContent: ["picName"],
  CorporateClient: ["name"],
  Branch: ["name", "area", "address"],
  SiteSettings: ["address", "partnershipEmail", "bookNowHref", "footerMembershipLearnHref", "footerPrivacyHref", "footerTermsHref"],
};
