/**
 * Bacaan publik konten "Our Story" (modul 10b).
 *
 * `OurStoryContent` singleton (id "singleton"). Fallback memakai deskripsi
 * situs + tagline footer yang sudah ada di `src/data/content.ts`.
 */
import { cacheLife, cacheTag } from "next/cache";

import { footerTagline, site } from "@/data/content";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type OurStory = {
  heroTitle: string;
  heroImageUrl: string | null;
  philosophyHtml: string;
  valuesHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

/**
 * Fallback statis: deskripsi brand + nilai utama. Juga dipakai untuk mengisi
 * form admin bila konten belum pernah disimpan, supaya menyimpan tanpa
 * perubahan menghasilkan halaman yang sama.
 */
export function staticOurStory(): OurStory {
  return {
    heroTitle: "A sanctuary for deep rest.",
    heroImageUrl: "/img/kama/07-flower-bowl.jpg",
    philosophyHtml: `<p>${site.description}</p><p>${footerTagline}</p>`,
    valuesHtml:
      "<ul><li>Traditional healing wisdom</li><li>High-touch, unrushed service</li><li>Deep exhale, real reset</li></ul>",
    seoTitle: null,
    seoDescription: null,
  };
}

export async function getOurStory(): Promise<OurStory> {
  "use cache";
  cacheTag(CONTENT_TAGS.ourStory);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.ourStoryContent.findUnique({ where: { id: "singleton" } });
    if (!row) throw new Error("our story belum diisi");
    return {
      heroTitle: row.heroTitle,
      heroImageUrl: row.heroImageUrl,
      philosophyHtml: row.philosophyHtml ?? "",
      valuesHtml: row.valuesHtml ?? "",
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
    };
  }, staticOurStory());

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
