import { asset } from "../asset-url.ts";

/** Isi awal untuk seed dan form admin — bukan untuk dirender ke pengunjung. */
export const GIFT_CARD_DEFAULTS = {
  subtitle: "A gift of time to truly pause.",
  whatsappMessage: "Hi KAMA, I'd like to buy a KAMA Gift Card",
} as const;

export type GiftCard = {
  title: string;
  subtitle: string;
  bodyHtml: string;
  imageUrl: string | null;
  termsHtml: string | null;
  whatsappMessage: string;
};

/** Isi awal gift card: dipakai `scripts/seed.mts` dan form admin. */
export function staticGiftCard(): GiftCard {
  return {
    title: "KAMA Gift Card",
    subtitle: GIFT_CARD_DEFAULTS.subtitle,
    termsHtml: null,
    whatsappMessage: GIFT_CARD_DEFAULTS.whatsappMessage,
    bodyHtml:
      "<p>The KAMA Gift Card is the quickest way to give a gift that matters. Valid for every treatment and ritual at KAMA Spa, and ready to enjoy any time with someone close to you.</p><ul><li>Flexible amounts to suit any occasion</li><li>Valid for all treatments</li><li>Order and pay via WhatsApp</li></ul>",
    imageUrl: asset("img/kama/05-foot-bath.jpg"),
  };
}
