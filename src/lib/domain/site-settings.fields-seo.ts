/** Field skema Kontak & Umum: SEO root dan tautan struktural footer. */
import { z } from "zod";

import { optionalCtaHref } from "./site-settings.schema-helpers.ts";

export const seoFields = {
  seoSiteName: z.string().trim().max(60, "Nama situs maks. 60 karakter."),
  seoDefaultTitle: z.string().trim().max(120, "Judul bawaan maks. 120 karakter."),
  seoDefaultDescription: z.string().trim().max(300, "Deskripsi bawaan maks. 300 karakter."),
  seoOgDescription: z.string().trim().max(300, "Deskripsi OG maks. 300 karakter."),
  seoOgLocale: z.string().trim().max(10, "Locale OG maks. 10 karakter (mis. id_ID)."),
  seoTitleTemplate: z.string().trim().max(120, "Template judul maks. 120 karakter."),
  seoKeywords: z
    .array(z.string().trim().max(40, "Satu keyword maks. 40 karakter."))
    .transform((keys) => keys.map((key) => key.trim()).filter(Boolean))
    .refine((keys) => keys.length <= 20, "Keywords maks. 20 butir."),
  footerMembershipLearnHref: optionalCtaHref("Tujuan Learn More"),
  footerPrivacyHref: optionalCtaHref("Tujuan Privacy Policy"),
  footerTermsHref: optionalCtaHref("Tujuan Terms & Conditions"),
};