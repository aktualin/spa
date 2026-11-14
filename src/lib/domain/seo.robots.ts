/** Robots, noindex, dan tanggal sitemap — lihat `seo.ts`. */
import type { MetadataRoute } from "next";

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