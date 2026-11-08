/**
 * Bacaan publik informasi gift card (modul 4).
 *
 * `GiftCardInfo` adalah singleton (id "singleton"). `bodyHtml` disimpan
 * ter-sanitasi; di halaman publik dirender ulang lewat `sanitizeHtml`.
 */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type GiftCard = {
  title: string;
  bodyHtml: string;
  imageUrl: string | null;
};

/** Fallback statis: penjelasan singkat gift card. */
function staticGiftCard(): GiftCard {
  return {
    title: "KAMA Gift Card",
    bodyHtml:
      "<p>KAMA Gift Card adalah cara tercepat untuk hadiah yang berarti. Berlaku untuk seluruh treatment dan ritual KAMA Spa, dan dapat dipakai kapan saja bersama orang terdekat.</p><ul><li>NominalFleksibel sesuai kebutuhan</li><li>Berlaku untuk semua treatment</li><li>Pemesanan dan pembayaran lewat WhatsApp</li></ul>",
    imageUrl: "/img/kama/05-foot-bath.jpg",
  };
}

export async function getGiftCard(): Promise<GiftCard> {
  "use cache";
  cacheTag(CONTENT_TAGS.giftCard);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.giftCardInfo.findUnique({ where: { id: "singleton" } });
    if (!row) throw new Error("gift card belum diisi");
    return {
      title: row.title,
      bodyHtml: row.bodyHtml,
      imageUrl: row.imageUrl,
    };
  }, staticGiftCard());

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
