/** Konfigurasi section banner homepage — lihat `homepage-banner.ts`. */

export const BANNER_KEYS = ["hero", "membership-banner", "booking-banner"] as const;

export type BannerKey = (typeof BANNER_KEYS)[number];

export function isBannerKey(key: string): key is BannerKey {
  return (BANNER_KEYS as readonly string[]).includes(key);
}

/** Batas panjang isian (karakter). */
export const BANNER_LIMITS = {
  title: 120,
  subtitle: 300,
  imageAlt: 200,
  ctaLabel: 40,
  ctaHref: 500,
  imageUrl: 1000,
} as const;

/** Field yang relevan per section; field lain tidak ditampilkan di form. */
export type BannerFieldConfig = {
  /** Gambar utama + gambar mobile + alt. */
  image: boolean;
  /**
   * true bila gambar boleh tanpa alt (gambar dekoratif). Hanya hero: gambar
   * hero adalah latar belakang di balik teks H1 yang sudah menjelaskan isi
   * halaman, jadi pembaca layar sebaiknya melewatinya (`alt=""`).
   */
  decorativeImage: boolean;
  /** Pakai `subtitle`? (eyebrow pada hero, deskripsi pada membership). */
  subtitle: boolean;
  titleLabel: string;
  subtitleLabel: string;
  ctaHint: string;
};

export const BANNER_FIELDS: Record<BannerKey, BannerFieldConfig> = {
  hero: {
    image: true,
    decorativeImage: true,
    subtitle: true,
    titleLabel: "Judul utama (H1)",
    subtitleLabel: "Eyebrow (teks kecil di atas judul)",
    ctaHint: "Tautan pada kartu putih di pojok hero (bawaan: “Book Now” → /contact).",
  },
  "membership-banner": {
    image: true,
    decorativeImage: false,
    subtitle: true,
    titleLabel: "Judul (baris miring)",
    subtitleLabel: "Teks deskripsi",
    ctaHint: "Tombol di bawah deskripsi (bawaan: “Join KAMA Now” → /membership).",
  },
  "booking-banner": {
    image: false,
    decorativeImage: false,
    subtitle: false,
    titleLabel: "Judul",
    subtitleLabel: "",
    ctaHint: "Tombol di samping judul (bawaan: “Get In Touch” → /contact).",
  },
};

/** Label yang disimpan ke `title` bila admin mengosongkan judul. */
export const BANNER_DEFAULT_TITLE: Record<BannerKey, string> = {
  hero: "Hero",
  "membership-banner": "Membership Banner",
  "booking-banner": "Booking Banner",
};