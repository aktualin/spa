/** Isi awal untuk seed dan form admin — bukan untuk dirender ke pengunjung. */
export const GIFT_CARD_DEFAULTS = {
  subtitle: "Hadiah yang isinya waktu untuk benar-benar berhenti sejenak.",
  whatsappMessage: "Halo kak, saya mau beli KAMA Gift Card",
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
      "<p>KAMA Gift Card adalah cara tercepat untuk hadiah yang berarti. Berlaku untuk seluruh treatment dan ritual KAMA Spa, dan dapat dipakai kapan saja bersama orang terdekat.</p><ul><li>NominalFleksibel sesuai kebutuhan</li><li>Berlaku untuk semua treatment</li><li>Pemesanan dan pembayaran lewat WhatsApp</li></ul>",
    imageUrl: "/img/kama/05-foot-bath.jpg",
  };
}
