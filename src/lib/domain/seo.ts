/**
 * Aturan SEO murni (tanpa I/O) — dipakai metadata publik, sitemap, robots,
 * dan dashboard `/admin/seo`. Diuji di `tests/unit/seo.test.mts`.
 */
import type { Metadata, MetadataRoute } from "next";

import { SLUG_PATTERN } from "./slug.ts";

export const SITE_NAME = "KAMA Spa";
export const TITLE_SEPARATOR = " • ";
export const TITLE_TEMPLATE = `%s${TITLE_SEPARATOR}${SITE_NAME}`;
export const DEFAULT_TITLE = "KAMA Spa • Wellness Sanctuary di South Jakarta";
export const DEFAULT_DESCRIPTION =
  "KAMA Spa adalah wellness sanctuary di jantung South Jakarta. Memadukan teknik penyembuhan tradisional dengan pendekatan wellness modern untuk treatments, massage, dan corporate wellness.";
export const DEFAULT_OG_DESCRIPTION =
  "Combining traditional healing techniques and modern wellness approaches, KAMA Spa offers thoughtfully curated treatments designed to restore balance, relaxation, and mindful presence.";
export const OG_LOCALE = "id_ID";

/** Panjang ideal yang dipakai Google sebelum teks dipotong. */
export const SEO_LIMITS = {
  titleMin: 30,
  titleMax: 60,
  descriptionMin: 70,
  descriptionMax: 160,
} as const;

/* ---------- Judul ---------- */

/**
 * Judul halaman yang sudah memuat nama brand dipakai apa adanya (absolute),
 * supaya tidak menjadi "KAMA Spa … • KAMA Spa".
 */
export function pageTitle(title: string): NonNullable<Metadata["title"]> {
  const trimmed = title.trim();
  return trimmed.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? { absolute: trimmed }
    : trimmed;
}

/** Judul seperti yang tampil di tab browser / hasil pencarian. */
export function formatPageTitle(title: string): string {
  const resolved = pageTitle(title);
  return typeof resolved === "string"
    ? TITLE_TEMPLATE.replace("%s", resolved)
    : (resolved as { absolute: string }).absolute;
}

/** Mengambil teks dari nilai `Metadata["title"]` apa pun bentuknya. */
export function titleText(title: Metadata["title"]): string | undefined {
  if (!title) return undefined;
  if (typeof title === "string") return title;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return undefined;
}

/* ---------- Penilaian panjang teks ---------- */

export type SeoTextStatus = "empty" | "short" | "ideal" | "long";

export type SeoTextAssessment = {
  length: number;
  status: SeoTextStatus;
  message: string;
};

export function assessSeoText(
  value: string | null | undefined,
  kind: "title" | "description",
): SeoTextAssessment {
  const text = (value ?? "").trim();
  const length = [...text].length;
  const min = kind === "title" ? SEO_LIMITS.titleMin : SEO_LIMITS.descriptionMin;
  const max = kind === "title" ? SEO_LIMITS.titleMax : SEO_LIMITS.descriptionMax;
  const label = kind === "title" ? "Title" : "Description";

  if (length === 0) {
    return { length, status: "empty", message: `${label} kosong — memakai bawaan.` };
  }
  if (length > max) {
    return {
      length,
      status: "long",
      message: `${label} ${length} karakter — lebih dari ${max}, kemungkinan dipotong Google.`,
    };
  }
  if (length < min) {
    return {
      length,
      status: "short",
      message: `${label} ${length} karakter — agak pendek (ideal ${min}–${max}).`,
    };
  }
  return { length, status: "ideal", message: `${label} ${length} karakter — ideal.` };
}

/* ---------- Path ---------- */

export function normalizeSeoPath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === "" || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "");
}

/** Pesan galat untuk path entri SEO, atau null bila valid. */
export function seoPathError(path: string): string | null {
  const value = path.trim();
  if (!value) return "Path wajib diisi.";
  if (!value.startsWith("/")) return 'Path harus diawali "/".';
  if (/\s/.test(value)) return "Path tidak boleh mengandung spasi.";
  if (/[?#]/.test(value)) return "Path tidak boleh memuat ? atau # — cukup alamat halamannya.";
  if (/^https?:/i.test(value) || value.startsWith("//")) {
    return "Isi path saja (mis. /contact), bukan URL lengkap.";
  }
  const normalized = normalizeSeoPath(value);
  if (/^\/(admin|api)(\/|$)/.test(normalized)) {
    return "Halaman admin dan API tidak diindeks, jadi tidak perlu entri SEO.";
  }
  return null;
}

/** true bila setiap segmen path berupa slug (huruf kecil, angka, tanda hubung). */
export function isSeoFriendlyPath(path: string): boolean {
  const normalized = normalizeSeoPath(path);
  if (normalized === "/") return true;
  return normalized
    .slice(1)
    .split("/")
    .every((segment) => SLUG_PATTERN.test(segment));
}

/* ---------- Google Search Console ---------- */

const GSC_TOKEN = /^[A-Za-z0-9_-]{10,100}$/;

export type GscParseResult =
  | { ok: true; code: string | null }
  | { ok: false; error: string };

/**
 * Menerima kode verifikasi saja, ATAU tempelan tag lengkap
 * `<meta name="google-site-verification" content="…" />`. Kosong = hapus.
 */
export function parseGscVerification(input: string | null | undefined): GscParseResult {
  const raw = (input ?? "").trim();
  if (!raw) return { ok: true, code: null };

  let code = raw;
  if (raw.startsWith("<")) {
    if (!/name\s*=\s*["']google-site-verification["']/i.test(raw)) {
      return {
        ok: false,
        error: 'Tag yang ditempel bukan tag "google-site-verification".',
      };
    }
    const match = raw.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!match) {
      return { ok: false, error: "Atribut content pada tag tidak ditemukan." };
    }
    code = match[1].trim();
  } else if (/^google-site-verification\s*=/i.test(raw)) {
    return {
      ok: false,
      error:
        "Itu kode untuk metode DNS (record TXT di pengelola domain). Pilih metode \"Tag HTML\" di Search Console lalu tempel tag-nya di sini.",
    };
  }

  if (!GSC_TOKEN.test(code)) {
    return {
      ok: false,
      error:
        "Kode verifikasi tidak valid. Tempel tag <meta …> dari Search Console atau isi atribut content-nya saja.",
    };
  }
  return { ok: true, code };
}

/* ---------- Metadata halaman ---------- */

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

/* ---------- Robots & sitemap ---------- */

/**
 * Mode noindex: preview Vercel, atau `SEO_NOINDEX=1` (mis. server staging).
 * Produksi tidak pernah noindex kecuali env itu diisi.
 */
export function indexingDisabled(env: Record<string, string | undefined>): boolean {
  const flag = env.SEO_NOINDEX?.trim().toLowerCase();
  if (flag === "1" || flag === "true") return true;
  return env.VERCEL_ENV === "preview";
}

export function buildRobots(siteUrl: string, noindex: boolean): MetadataRoute.Robots {
  if (noindex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

/** Tanggal terbaru dari daftar (null/undefined diabaikan). */
export function latestDate(...dates: (Date | null | undefined)[]): Date | undefined {
  let latest: Date | undefined;
  for (const date of dates) {
    if (!date || Number.isNaN(date.getTime())) continue;
    if (!latest || date > latest) latest = date;
  }
  return latest;
}

/* ---------- Daftar halaman publik tetap ---------- */

/** Kunci stempel waktu `lastModified` sitemap untuk halaman tetap. */
export type SitemapStampKey =
  | "home"
  | "catalog"
  | "promos"
  | "membership"
  | "corporate"
  | "story"
  | "journal"
  | "gallery"
  | "events"
  | "retail"
  | "giftCard"
  | "contact";

export type PublicStaticRoute = {
  path: string;
  label: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  group: SitemapStampKey;
  /** Halaman yang juga punya field SEO di modul kontennya. */
  contentEditor?: { label: string; href: string };
};

/** Route publik tetap (urutan = prioritas). /corporate-wellness redirect ke /corporate. */
export const PUBLIC_STATIC_ROUTES: readonly PublicStaticRoute[] = [
  { path: "/", label: "Beranda", priority: 1, changeFrequency: "weekly", group: "home" },
  { path: "/treatments", label: "Treatments", priority: 0.9, changeFrequency: "monthly", group: "catalog" },
  { path: "/treatments/packages", label: "Packages", priority: 0.8, changeFrequency: "monthly", group: "catalog" },
  { path: "/menu", label: "Menu", priority: 0.8, changeFrequency: "monthly", group: "catalog" },
  { path: "/promos", label: "Promos", priority: 0.8, changeFrequency: "weekly", group: "promos" },
  { path: "/membership", label: "Membership", priority: 0.7, changeFrequency: "monthly", group: "membership" },
  { path: "/promos/membership", label: "Promo Membership", priority: 0.7, changeFrequency: "monthly", group: "membership" },
  { path: "/corporate", label: "Corporate Wellness", priority: 0.7, changeFrequency: "monthly", group: "corporate" },
  {
    path: "/our-story",
    label: "Our Story",
    priority: 0.6,
    changeFrequency: "monthly",
    group: "story",
    contentEditor: { label: "Modul Our Story", href: "/admin/our-story" },
  },
  { path: "/our-story/journal", label: "Journal", priority: 0.6, changeFrequency: "weekly", group: "journal" },
  { path: "/gallery", label: "Gallery", priority: 0.6, changeFrequency: "monthly", group: "gallery" },
  { path: "/events", label: "Events", priority: 0.6, changeFrequency: "weekly", group: "events" },
  { path: "/events/collaborations", label: "Kolaborasi", priority: 0.5, changeFrequency: "monthly", group: "events" },
  { path: "/retail", label: "KAMA Retail", priority: 0.5, changeFrequency: "monthly", group: "retail" },
  { path: "/gift-card", label: "Gift Card", priority: 0.5, changeFrequency: "monthly", group: "giftCard" },
  { path: "/contact", label: "Contact", priority: 0.7, changeFrequency: "monthly", group: "contact" },
];
