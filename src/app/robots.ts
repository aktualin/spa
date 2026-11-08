import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

/**
 * `/robots.txt`.
 *
 * Dashboard admin dan route API tidak boleh diindeks: isinya bukan konten
 * publik, dan halaman login yang terindeks hanya memancing percobaan masuk.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
