/**
 * Bacaan publik informasi gift card (modul 4).
 *
 * `GiftCardInfo` adalah singleton (id "singleton"). `bodyHtml` disimpan
 * ter-sanitasi; di halaman publik dirender ulang lewat `sanitizeHtml`.
 *
 * Belum diisi admin atau DB tidak terbaca → `null` (halaman menampilkan empty
 * state). `staticGiftCard()` tetap ada, tapi hanya untuk mengisi awal form
 * admin — bukan untuk dirender ke pengunjung.
 */
import { cacheLife, cacheTag } from "next/cache";

import { GIFT_CARD_DEFAULTS } from "@/lib/domain/gift-card";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type GiftCard = {
  title: string;
  subtitle: string;
  bodyHtml: string;
  imageUrl: string | null;
  termsHtml: string | null;
  whatsappMessage: string;
};

/** Isi awal form admin saat gift card belum pernah disimpan. */
export function staticGiftCard(): GiftCard {
  return {
    title: "KAMA Gift Card",
    subtitle: GIFT_CARD_DEFAULTS.subtitle,
    termsHtml: null,
    whatsappMessage: GIFT_CARD_DEFAULTS.whatsappMessage,
    bodyHtml:
      "<p>KAMA Gift Card adalah cara tercepat untuk hadiah yang berarti. Berlaku untuk seluruh treatment dan ritual KAMA Spa, dan dapat dipakai kapan saja bersama orang terdekat.</p><ul><li>NominalFleksibel sesuai kebutuhan</li><li>Berlaku untuk semua treatment</li><li>Pemesanan dan pembayaran lewat WhatsApp</li></ul>",
    imageUrl: "/img/kama/05-foot-bath.jpg",
  };
}

export async function getGiftCard(): Promise<GiftCard | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.giftCard);

  const { data, usedFallback } = await safeQueryWithMeta<GiftCard | null>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.giftCardInfo.findUnique({ where: { id: "singleton" } });
    if (!row) return null;
    return {
      title: row.title,
      subtitle: row.subtitle || GIFT_CARD_DEFAULTS.subtitle,
      bodyHtml: row.bodyHtml,
      imageUrl: row.imageUrl,
      termsHtml: row.termsHtml,
      whatsappMessage: row.whatsappMessage || GIFT_CARD_DEFAULTS.whatsappMessage,
    };
  }, null);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
