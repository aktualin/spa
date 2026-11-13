/**
 * Bacaan publik konten "Our Story" (modul 10b).
 *
 * `OurStoryContent` singleton (id "singleton"). Belum diisi admin atau DB
 * tidak terbaca → `null` (halaman menampilkan empty state). `staticOurStory()`
 * tetap ada, tapi hanya untuk mengisi awal form admin — bukan untuk dirender
 * ke pengunjung.
 */
import { cacheLife, cacheTag } from "next/cache";

import { footerTagline, site } from "@/data/content";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";
import { asset } from "@/lib/asset-url";

export type OurStory = {
  heroTitle: string;
  heroImageUrl: string | null;
  philosophyHtml: string;
  valuesHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

/**
 * Isi awal form admin saat konten belum pernah disimpan, supaya menyimpan
 * tanpa perubahan menghasilkan halaman yang masuk akal.
 */
export function staticOurStory(): OurStory {
  return {
    heroTitle: "A sanctuary for deep rest.",
    heroImageUrl: asset("img/kama/07-flower-bowl.jpg"),
    philosophyHtml: `<p>${site.description}</p><p>${footerTagline}</p>`,
    valuesHtml:
      "<ul><li>Traditional healing wisdom</li><li>High-touch, unrushed service</li><li>Deep exhale, real reset</li></ul>",
    seoTitle: null,
    seoDescription: null,
  };
}

export async function getOurStory(): Promise<OurStory | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.ourStory);

  const { data, usedFallback } = await safeQueryWithMeta<OurStory | null>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.ourStoryContent.findUnique({ where: { id: "singleton" } });
    if (!row) return null;
    return {
      heroTitle: row.heroTitle,
      heroImageUrl: row.heroImageUrl,
      philosophyHtml: row.philosophyHtml ?? "",
      valuesHtml: row.valuesHtml ?? "",
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
    };
  }, null);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
