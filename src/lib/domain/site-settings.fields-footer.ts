/** Field skema Kontak & Umum: footer, partnership, menu, dan brand. */
import { z } from "zod";

import { isSafeCtaHref } from "./homepage-banner.ts";
import { isBlank } from "./text.ts";
import {
  MAX_BOOK_NOW_LABEL,
  MAX_FOOTER_MEMBERSHIP_LABEL,
  MAX_FOOTER_MEMBERSHIP_TITLE,
  MAX_FOOTER_TAGLINE,
  MAX_PARTNERSHIP_INTRO,
  MAX_PRICE_DISCLAIMER,
} from "./site-settings.input.ts";
import { optionalImageUrl } from "./site-settings.schema-helpers.ts";

export const footerFields = {
  footerTagline: z
    .string()
    .trim()
    .max(MAX_FOOTER_TAGLINE, `Tagline footer maks. ${MAX_FOOTER_TAGLINE} karakter.`),
  footerMembershipTitle: z
    .string()
    .trim()
    .max(
      MAX_FOOTER_MEMBERSHIP_TITLE,
      `Judul CTA membership maks. ${MAX_FOOTER_MEMBERSHIP_TITLE} karakter.`,
    ),
  footerMembershipLearnLabel: z
    .string()
    .trim()
    .max(
      MAX_FOOTER_MEMBERSHIP_LABEL,
      `Label tombol “Learn More” maks. ${MAX_FOOTER_MEMBERSHIP_LABEL} karakter.`,
    ),
  footerMembershipJoinLabel: z
    .string()
    .trim()
    .max(
      MAX_FOOTER_MEMBERSHIP_LABEL,
      `Label tombol “Join” maks. ${MAX_FOOTER_MEMBERSHIP_LABEL} karakter.`,
    ),
  partnershipIntro: z
    .string()
    .trim()
    .max(
      MAX_PARTNERSHIP_INTRO,
      `Kalimat partnership maks. ${MAX_PARTNERSHIP_INTRO} karakter.`,
    ),
  partnershipEmail: z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || z.email().safeParse(value).success,
      "Email partnership tidak valid.",
    )
    .transform((value) => value.toLowerCase()),
  priceDisclaimer: z
    .string()
    .trim()
    .max(
      MAX_PRICE_DISCLAIMER,
      `Catatan harga maks. ${MAX_PRICE_DISCLAIMER} karakter.`,
    ),
  bookNowLabel: z
    .string()
    .trim()
    .max(MAX_BOOK_NOW_LABEL, `Label Book Now maks. ${MAX_BOOK_NOW_LABEL} karakter.`),
  bookNowHref: z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || isSafeCtaHref(value),
      "Tujuan Book Now harus path internal (/contact), anchor (#booking), atau URL https://.",
    ),
  logoMarkLightUrl: optionalImageUrl("Mark logo terang"),
  logoMarkDarkUrl: optionalImageUrl("Mark logo gelap"),
  logoLockupUrl: optionalImageUrl("Lockup logo"),
  brandWordmarkTop: z.string().trim().max(20, "Wordmark atas maks. 20 karakter."),
  brandWordmarkBottom: z.string().trim().max(20, "Wordmark bawah maks. 20 karakter."),
  brandLogoAlt: z.string().trim().max(60, "Alt logo maks. 60 karakter."),
};