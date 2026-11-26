/** Copy permukaan konten: ContentBlock, HomepageSection, SiteSettings, WhatsApp. */
import {
  CONTENT_BLOCKS,
  EXTRA_CONTENT_BLOCKS,
  LINKS_MICROCOPY_FORMS_BLOCKS,
  HOMEPAGE_SECTIONS,
} from "../seed-content.mts";
import { site, priceDisclaimer } from "../../src/data/content.ts";
import { staticMembershipProgram } from "../../src/lib/domain/membership.ts";
import { WHATSAPP_CONTEXTS } from "../../src/lib/domain/whatsapp-template.ts";
import {
  SITE_NAME,
  TITLE_TEMPLATE,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_DESCRIPTION,
  OG_LOCALE,
} from "../../src/lib/domain/seo.ts";
import { row, type CopyRow } from "./collect.types.mts";

export function contentBlocks(): CopyRow[] {
  return [...CONTENT_BLOCKS, ...EXTRA_CONTENT_BLOCKS, ...LINKS_MICROCOPY_FORMS_BLOCKS].map((b) =>
    row("ContentBlock", { key: b.key }, { value: b.value }),
  );
}

export function homepageSections(): CopyRow[] {
  return HOMEPAGE_SECTIONS.map((s) =>
    row("HomepageSection", { key: s.key }, {
      eyebrow: s.eyebrow ?? null,
      title: s.title,
      subtitle: s.subtitle ?? null,
      imageAlt: s.imageAlt ?? null,
      ctaLabel: s.ctaLabel ?? null,
    }),
  );
}

/** Field turunan/konstanta; literal footer yang berubah ada di inline-literals.mts. */
export function siteSettings(): CopyRow[] {
  return [row("SiteSettings", { id: "singleton" }, {
    address: site.address,
    openingHours: [site.hours],
    priceDisclaimer,
    footerTagline: staticMembershipProgram().intro,
    brandWordmarkTop: "KAMA",
    brandWordmarkBottom: "SPA",
    brandLogoAlt: "KAMA Spa",
    seoSiteName: SITE_NAME,
    seoDefaultTitle: DEFAULT_TITLE,
    seoDefaultDescription: DEFAULT_DESCRIPTION,
    seoOgDescription: DEFAULT_OG_DESCRIPTION,
    seoOgLocale: OG_LOCALE,
    seoTitleTemplate: TITLE_TEMPLATE,
    seoKeywords: [
      "KAMA Spa", "massage Jakarta", "spa South Jakarta", "day spa",
      "corporate wellness", "Sukma Laya", "Urip Padma",
    ],
  })];
}

export function whatsAppTemplates(): CopyRow[] {
  return WHATSAPP_CONTEXTS.map((c) =>
    row("WhatsAppTemplate", { key: c.key }, { message: c.builtIn }),
  );
}
