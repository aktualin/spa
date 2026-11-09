/**
 * Bacaan publik informasi gift card (modul 4).
 *
 * `GiftCardInfo` adalah singleton (id "singleton"). `bodyHtml` disimpan
 * ter-sanitasi; di halaman publik dirender ulang lewat `sanitizeHtml`.
 *
 * Belum diisi admin atau DB tidak terbaca → `null` (halaman menampilkan empty
 * state). Tanpa fallback statis per kolom: kolom yang dikosongkan admin tetap
 * kosong dan elemennya disembunyikan. `staticGiftCard()` tetap ada, tapi hanya
 * untuk seed dan mengisi awal form admin — bukan untuk dirender ke pengunjung.
 */
import { cacheLife, cacheTag } from "next/cache";

import { staticGiftCard, type GiftCard } from "@/lib/domain/gift-card";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type { GiftCard };
export { staticGiftCard };

export async function getGiftCard(): Promise<GiftCard | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.giftCard);

  const { data, usedFallback } = await safeQueryWithMeta<GiftCard | null>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.giftCardInfo.findUnique({ where: { id: "singleton" } });
    if (!row) return null;
    return {
      title: row.title,
      subtitle: row.subtitle ?? "",
      bodyHtml: row.bodyHtml,
      imageUrl: row.imageUrl,
      termsHtml: row.termsHtml,
      whatsappMessage: row.whatsappMessage ?? "",
    };
  }, null);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
