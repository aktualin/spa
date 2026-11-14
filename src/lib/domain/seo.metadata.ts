/** Penggabungan metadata halaman — lihat `seo.ts`. */
import type { Metadata } from "next";

import { OG_LOCALE, SITE_NAME } from "./seo.constants.ts";
import { normalizeSeoPath } from "./seo.path.ts";
import { pageTitle, titleText } from "./seo.title.ts";

export type SeoOverride = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export type SeoSiteDefaults = {
  defaultOgImageUrl: string | null;
};

type OgImages = NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;

function hasImages(images: OgImages | undefined | null): boolean {
  if (!images) return false;
  return Array.isArray(images) ? images.length > 0 : true;
}

/**
 * Menggabungkan metadata bawaan halaman dengan override `PageSeo` dan
 * pengaturan global. Hasilnya selalu lengkap: canonical, og:url/type/
 * site_name/locale/title/description/image, dan twitter card.
 *
 * Prioritas gambar OG: override PageSeo → gambar bawaan halaman → OG global.
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

  const title = override?.title ? pageTitle(override.title) : defaults.title;
  const description =
    override?.description ??
    (typeof defaults.description === "string" ? defaults.description : undefined);

  const ogTitle =
    (override?.title ? override.title.trim() : undefined) ??
    titleText(baseOg.title as Metadata["title"]) ??
    titleText(defaults.title);
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
  return merged;
}

/** `metadata.icons`: favicon admin bila ada, selain itu `/favicon.ico` bawaan. */
export function faviconIcons(faviconUrl: string | null | undefined): Metadata["icons"] {
  const url = faviconUrl?.trim();
  if (!url) return { icon: [{ url: "/favicon.ico", sizes: "any" }] };
  return { icon: [{ url }], shortcut: [{ url }], apple: [{ url }] };
}