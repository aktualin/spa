/** Bacaan section homepage dari database — lihat `homepage.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import type { HomepageSection, HomepageSectionKey } from "./homepage.types";
import { CONTENT_TAGS } from "./tags";

/**
 * Map `key` → section dari DB. Tidak ada section bawaan: homepage hanya
 * merender baris yang memang ada di database dan aktif. Baris `footer` hanya
 * berupa saklar tampil/sembunyi footer di homepage (halaman lain selalu
 * menampilkan footer).
 */
export async function getHomepageSections(): Promise<
  Record<string, HomepageSection>
> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);

  const { data, usedFallback } = await safeQueryWithMeta<
    Record<string, HomepageSection>
  >(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.homepageSection.findMany({
        orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
      });
      return Object.fromEntries(
        rows.map((row) => [
          row.key,
          {
            key: row.key as HomepageSectionKey,
            eyebrow: row.eyebrow,
            title: row.title,
            subtitle: row.subtitle,
            bodyHtml: row.bodyHtml,
            imageUrl: row.imageUrl,
            mobileImageUrl: row.mobileImageUrl,
            imageAlt: row.imageAlt,
            ctaLabel: row.ctaLabel,
            ctaHref: row.ctaHref,
            isEnabled: row.isEnabled,
            sortOrder: row.sortOrder,
          },
        ]),
      );
    },
    {},
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}