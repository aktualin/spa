import type { MetadataRoute } from "next";

import { buildRobots, indexingDisabled } from "@/lib/domain/seo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * `/robots.txt`.
 *
 * Dashboard admin dan route API tidak boleh diindeks: isinya bukan konten
 * publik, dan halaman login yang terindeks hanya memancing percobaan masuk.
 * Daftar URL publik ada di `/sitemap.xml` (di-generate dari database).
 *
 * Preview Vercel atau env `SEO_NOINDEX=1` (staging) → seluruh situs diblokir.
 */
export default function robots(): MetadataRoute.Robots {
  return buildRobots(getSiteUrl(), indexingDisabled(process.env));
}
