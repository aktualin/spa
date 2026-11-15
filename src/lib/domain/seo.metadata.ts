/** Penggabungan metadata halaman — lihat `seo.ts`. */
import type { Metadata } from "next";

import { FALLBACK_KEYWORDS, OG_LOCALE, SITE_NAME } from "./seo.constants.ts";
import { routeSeoDefaults, resolveRouteKeywords } from "./seo.pages.ts";
import { normalizeSeoPath } from "./seo.path.ts";
import { pageTitle, titleText } from "./seo.title.ts";

export type SeoOverride = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export type SeoSiteDefaults = {
  defaultOgImageUrl: string | null;
  /** Keywords global dari Kontak & Umum; kosong → `FALLBACK_KEYWORDS`. */
  keywords?: readonly string[];
};

type OgImages = NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;

function hasImages(images: OgImages | undefined | null): boolean {
  if (!images) return false;
  return Array.isArray(images) ? images.length > 0 : true;
}

/**
 * Menggabungkan metadata bawaan halaman dengan registry bawaan per route
 * (`PAGE_SEO_DEFAULTS`), override `PageSeo`, dan pengaturan global. Hasilnya
 * selalu lengkap: title, description, keywords, canonical, og:url/type/
 * site_name/locale/title/description/image, dan twitter card.
 *
 * Prioritas: override PageSeo → bawaan eksplisit halaman → registry per
 * route → default global (diwarisi dari root layout). Keywords halaman =
 * bawaan eksplisit, atau gabungan keywords route + keywords global (dedupe).
 * Field override yang kosong tidak menimpa bawaan.
 */
export function mergePageSeo(
  path: string,
  defaults: Metadata,
  override: SeoOverride | null,
  site: SeoSiteDefaults,
): Metadata {
  const canonicalPath = normalizeSeoPath(path);
  const baseOg = (defaults.openGraph ?? {}) as Record<string, unknown>;
  const route = routeSeoDefaults(canonicalPath);

  const title = override?.title
    ? pageTitle(override.title)
    : (defaults.title ?? (route?.title ? pageTitle(route.title) : undefined));
  const description =
    override?.description ??
    (typeof defaults.description === "string" ? defaults.description : undefined) ??
    route?.description;

  const ogTitle =
    (override?.title ? override.title.trim() : undefined) ??
    titleText(baseOg.title as Metadata["title"]) ??
    // `title` sudah teresolusi (bawaan halaman → registry route), jadi OG
    // tidak kehilangan judul saat halaman tidak menyetel openGraph sendiri.
    titleText(title);
  const ogDescription =
    override?.description ??
    (typeof baseOg.description === "string" ? baseOg.description : undefined) ??
    description;

  let images: OgImages | undefined;
  if (override?.ogImageUrl) images = [{ url: override.ogImageUrl }];
  else if (hasImages(baseOg.images as OgImages | undefined)) images = baseOg.images as OgImages;
  else if (site.defaultOgImageUrl) images = [{ url: site.defaultOgImageUrl }];

  const canonical = defaults.alternates?.canonical ?? canonicalPath;

  const openGraph = {
    type: "website",
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    ...baseOg,
    url: (baseOg.url as string | undefined) ?? canonicalPath,
    ...(ogTitle ? { title: ogTitle } : {}),
    ...(ogDescription ? { description: ogDescription } : {}),
    ...(images ? { images } : {}),
  } as Metadata["openGraph"];

  const merged: Metadata = {
    ...defaults,
    alternates: { ...defaults.alternates, canonical },
    openGraph,
    // Judul, deskripsi, dan gambar twitter diisi otomatis oleh Next.js dari
    // Open Graph, jadi cukup jenis kartunya.
    twitter: { card: images ? "summary_large_image" : "summary" },
  };
  if (title !== undefined) merged.title = title;
  if (description !== undefined) merged.description = description;

  // Keywords: bawaan eksplisit halaman menang; selain itu gabungan keywords
  // registry route + keywords global (Kontak & Umum, atau fallback domain).
  if (defaults.keywords !== undefined) {
    merged.keywords = defaults.keywords;
  } else {
    const keywords = resolveRouteKeywords(
      route?.keywords,
      site.keywords?.length ? site.keywords : FALLBACK_KEYWORDS,
    );
    if (keywords.length > 0) merged.keywords = keywords;
  }
  return merged;
}

/** `metadata.icons`: favicon admin bila ada, selain itu `/favicon.ico` bawaan. */
export function faviconIcons(faviconUrl: string | null | undefined): Metadata["icons"] {
  const url = faviconUrl?.trim();
  if (!url) return { icon: [{ url: "/favicon.ico", sizes: "any" }] };
  return { icon: [{ url }], shortcut: [{ url }], apple: [{ url }] };
}