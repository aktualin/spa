/**
 * Skema form admin Kontak & Umum. Field dikelompokkan per bagian form
 * (kontak, sosial, footer/brand, SEO) lalu digabung menjadi satu skema —
 * urutan field sama dengan urutan di form.
 */
import { z } from "zod";

import { contactFields } from "./site-settings.fields-contact.ts";
import { footerFields } from "./site-settings.fields-footer.ts";
import { seoFields } from "./site-settings.fields-seo.ts";
import { socialFields } from "./site-settings.fields-social.ts";

export const siteSettingsInputSchema = z.object({
  ...contactFields,
  ...socialFields,
  ...footerFields,
  ...seoFields,
});

export type SiteSettingsParsed = z.output<typeof siteSettingsInputSchema>;