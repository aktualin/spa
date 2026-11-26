/** Bawaan SEO per route tetap: beranda, katalog, promo, membership, corporate. */
import type { PageSeoDefaults } from "./seo.pages.ts";

/**
 * Entri corporate dipakai dua kunci: `/corporate` dan path lama
 * `/corporate-wellness`. Halaman corporate memanggil `withPageSeo` dua kali
 * (inner `/corporate-wellness` untuk mewarisi override SEO lama), jadi tanpa
 * alias ini keywords route tidak pernah ikut ke hasil akhir.
 */
const CORPORATE: PageSeoDefaults = {
  title: "Corporate Wellness Programs in Jakarta",
  description:
    "KAMA Spa corporate wellness for companies: on-site massage, employee wellness packages, and brand collaborations. Contact our marketing team for a proposal.",
  keywords: [
    "corporate wellness",
    "office massage Jakarta",
    "employee wellness",
    "company wellness programs",
  ],
};

export const PAGE_SEO_DATA_MAIN: Readonly<Record<string, PageSeoDefaults>> = {
  // Judul/deskripsi "/" datang dari konstanta root (DEFAULT_TITLE dst.);
  // entri ini hanya memasok keywords khusus beranda.
  "/": {
    keywords: [
      "spa South Jakarta",
      "wellness sanctuary",
      "massage Jakarta",
      "day spa Jakarta",
    ],
  },
  "/treatments": {
    title: "Spa Treatments & Massage in Jakarta",
    description:
      "Explore the KAMA Spa treatment collection: traditional massage, body treatments, facials, and head & bath rituals. See duration, benefits, and price for each.",
    keywords: [
      "spa treatments",
      "massage Jakarta",
      "body treatment",
      "facial Jakarta",
      "spa prices Jakarta",
    ],
  },
  "/treatments/packages": {
    title: "Curated Spa Packages in South Jakarta",
    description:
      "KAMA Spa curated packages for complete relaxation — massage, body treatments, and rituals combined at a package price that saves more than booking separately.",
    keywords: ["spa packages", "massage packages", "spa package Jakarta", "spa package prices"],
  },
  "/menu": {
    title: "Full Spa Menu & Prices in South Jakarta",
    description:
      "The complete KAMA Spa menu with durations and prices — from massage, body scrubs, and facials to head therapy, bath rituals, and additional services.",
    keywords: ["spa menu", "spa prices Jakarta", "spa treatment list", "spa price list"],
  },
  "/promos": {
    title: "Latest Spa & Massage Promos in Jakarta",
    description:
      "The latest KAMA Spa promotions: treatment discounts, value packages, and special member offers. Book via WhatsApp — promo slots are limited each month.",
    keywords: ["spa promos", "massage promos Jakarta", "spa discounts", "spa offers"],
  },
  "/membership": {
    title: "Spa Membership Plans in South Jakarta",
    description:
      "Become a KAMA Spa member and enjoy member prices, priority booking, and exclusive benefits for your routine care. Explore membership tiers and how to join.",
    keywords: ["spa membership", "spa member Jakarta", "member benefits", "spa subscription"],
  },
  "/promos/membership": {
    title: "Special Membership Offers in Jakarta",
    description:
      "Special KAMA Spa membership offers — joining deals, tier upgrades, and exclusive member benefits for routine wellness care in South Jakarta.",
    keywords: ["membership promo", "spa member promo", "membership discount"],
  },
  "/corporate": CORPORATE,
  "/corporate-wellness": CORPORATE,
};
