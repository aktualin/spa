import type { Metadata } from "next";
import { getSeoSettings } from "@/lib/content/seo";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_DESCRIPTION,
  DEFAULT_TITLE,
  OG_LOCALE,
  SITE_NAME,
  TITLE_TEMPLATE,
  faviconIcons,
  indexingDisabled,
} from "@/lib/domain/seo";
import { getSiteUrl } from "@/lib/site-url";

/** Keywords cadangan bila admin belum mengisi daftar keywords di Kontak & Umum. */
const FALLBACK_KEYWORDS = [
  "KAMA Spa",
  "massage Jakarta",
  "spa South Jakarta",
  "day spa",
  "corporate wellness",
  "Sukma Laya",
  "Urip Padma",
];

/**
 * Metadata root. Favicon, gambar OG bawaan, verifikasi Google Search Console,
 * dan teks SEO global (nama situs, judul/deskripsi bawaan, OG, locale,
 * template judul, keywords) dibaca dari `/admin/seo/settings` + Kontak & Umum
 * lewat fungsi `"use cache"`, jadi perubahan tampil tanpa redeploy dan situs
 * tetap bisa di-prerender. Kolom yang kosong jatuh ke konstanta domain/seo.
 *
 * Canonical SENGAJA tidak diset di sini: nilai root diwarisi semua halaman
 * yang tidak mengisinya sendiri, dan canonical "/" di halaman lain menyuruh
 * Google mengabaikan halaman tersebut. Canonical diisi per halaman oleh
 * `withPageSeo`.
 */
export async function generateRootMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  const ogImages = settings.defaultOgImageUrl
    ? [{ url: settings.defaultOgImageUrl }]
    : undefined;
  const siteName = settings.seoSiteName || SITE_NAME;
  const defaultTitle = settings.seoDefaultTitle || DEFAULT_TITLE;
  const description = settings.seoDefaultDescription || DEFAULT_DESCRIPTION;
  const ogDescription = settings.seoOgDescription || DEFAULT_OG_DESCRIPTION;

  return {
    // Tanpa ini, URL Open Graph dan canonical dirender relatif dan ditolak
    // sebagian crawler.
    metadataBase: new URL(getSiteUrl()),
    applicationName: siteName,
    title: {
      default: defaultTitle,
      template: settings.seoTitleTemplate || TITLE_TEMPLATE,
    },
    description,
    keywords:
      settings.seoKeywords.length > 0 ? settings.seoKeywords : FALLBACK_KEYWORDS,
    openGraph: {
      title: defaultTitle,
      description: ogDescription,
      type: "website",
      locale: settings.seoOgLocale || OG_LOCALE,
      siteName,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: { card: ogImages ? "summary_large_image" : "summary" },
    icons: faviconIcons(settings.faviconUrl),
    ...(settings.gscVerification
      ? { verification: { google: settings.gscVerification } }
      : {}),
    ...(indexingDisabled(process.env)
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}