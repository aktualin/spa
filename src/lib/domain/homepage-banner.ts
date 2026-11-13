import { asset } from "../asset-url.ts";

/**
 * Aturan banner/hero homepage (section `hero`, `membership-banner`,
 * `booking-banner`).
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 * Dipakai di dua sisi:
 *
 * - Server Action admin: `validateBannerInput` memvalidasi isian form.
 * - Homepage publik: `resolveBanner` menggabungkan isian admin dengan nilai
 *   bawaan (hardcode lama). Field kosong/null → nilai bawaan, sehingga
 *   tampilan default identik dengan sebelum fitur ini ada.
 *
 * ## Aturan judul (PENTING)
 *
 * Kolom `title` di DB sejak awal berisi LABEL ADMIN ("Hero",
 * "Membership Banner", "Booking Banner", dsb. — dari seed dan dari tombol
 * "Tambahkan section"). Label itu tidak boleh muncul sebagai H1/H2 di situs.
 * Karena itu `title` hanya dipakai sebagai judul tampil bila isinya BUKAN
 * salah satu label bawaan section tersebut (lihat `isPlaceholderTitle`).
 * Mengosongkan judul di form admin menyimpan kembali label bawaan, sehingga
 * frontend kembali memakai teks hardcode. Konsekuensinya, menjalankan ulang
 * seed (yang menimpa `title` dengan label) mengembalikan judul ke teks bawaan
 * — aman, tidak pernah menampilkan label admin.
 */

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

/**
 * Semua label admin yang pernah dipakai sebagai `title` (seed, fallback
 * `getHomepageSections`, dan `sectionKeyLabel`). Dibandingkan tanpa
 * membedakan huruf besar/kecil.
 */
const PLACEHOLDER_TITLES: Record<BannerKey, readonly string[]> = {
  hero: ["hero"],
  "membership-banner": ["membership banner", "banner membership", "membership-banner"],
  "booking-banner": ["booking banner", "banner booking", "booking-banner"],
};

/**
 * Label admin yang pernah tersimpan sebagai `title` pada section NON-banner
 * yang judulnya kini dirender di homepage. Tanpa ini, database lama yang masih
 * menyimpan label seed akan menampilkannya sebagai judul section.
 */
const LEGACY_SECTION_LABELS: Record<string, readonly string[]> = {
  "whats-new": ["promo / event highlight", "promo/event highlight", "whats new"],
};

/** true bila `title` hanyalah label admin (bukan teks untuk pengunjung). */
export function isPlaceholderTitle(key: string, title: string | null | undefined): boolean {
  const normalized = (title ?? "").trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === key.toLowerCase()) return true;
  if (LEGACY_SECTION_LABELS[key]?.includes(normalized)) return true;
  if (!isBannerKey(key)) return false;
  return PLACEHOLDER_TITLES[key].includes(normalized);
}

/** Judul tampil dari `title`, atau null bila hanya label admin. */
export function displayTitle(key: string, title: string | null | undefined): string | null {
  return isPlaceholderTitle(key, title) ? null : (title ?? "").trim();
}

// ---------------------------------------------------------------------------
// Validasi URL
// ---------------------------------------------------------------------------

/** Path internal: diawali satu "/", bukan "//" atau "/\" (protocol-relative). */
function isInternalPath(value: string): boolean {
  return /^\/(?![/\\])[^\s]*$/.test(value);
}

function isHttpsUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Tujuan tombol yang diizinkan: path internal (`/menu`), anchor (`#booking`),
 * atau URL `https://…`. Menolak `//host`, `javascript:`, `http:`, dsb.
 */
export function isSafeCtaHref(value: string): boolean {
  if (!value || value.length > BANNER_LIMITS.ctaHref) return false;
  if (value.startsWith("#")) return /^#[A-Za-z0-9][\w:.-]*$/.test(value);
  if (value.startsWith("/")) return isInternalPath(value);
  return isHttpsUrl(value);
}

/**
 * URL gambar: hanya `https://…` (bucket S3 Supabase Storage). Path lokal
 * (`/img/…`) ditolak — tidak ada lagi media yang dilayani dari `public/`.
 */
export function isSafeImageUrl(value: string): boolean {
  if (!value || value.length > BANNER_LIMITS.imageUrl) return false;
  return isHttpsUrl(value);
}

// ---------------------------------------------------------------------------
// Validasi isian form admin
// ---------------------------------------------------------------------------

export type BannerRawInput = {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

/** Data siap simpan ke `HomepageSection` (kosong → null). */
export type BannerData = {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type BannerValidation =
  | { ok: true; data: BannerData }
  | { ok: false; error: string };

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/**
 * Validasi isian banner untuk `key`. Field yang tidak relevan untuk section
 * tersebut (mis. gambar pada booking-banner) diabaikan dan disimpan null.
 */
export function validateBannerInput(key: BannerKey, raw: BannerRawInput): BannerValidation {
  const config = BANNER_FIELDS[key];
  const fail = (error: string): BannerValidation => ({ ok: false, error });

  const title = clean(raw.title);
  const subtitle = config.subtitle ? clean(raw.subtitle) : "";
  const imageUrl = config.image ? clean(raw.imageUrl) : "";
  const mobileImageUrl = config.image ? clean(raw.mobileImageUrl) : "";
  const imageAlt = config.image ? clean(raw.imageAlt) : "";
  const ctaLabel = clean(raw.ctaLabel);
  const ctaHref = clean(raw.ctaHref);

  if (title.length > BANNER_LIMITS.title) {
    return fail(`Judul maksimal ${BANNER_LIMITS.title} karakter.`);
  }
  if (subtitle.length > BANNER_LIMITS.subtitle) {
    return fail(`${config.subtitleLabel} maksimal ${BANNER_LIMITS.subtitle} karakter.`);
  }
  if (imageUrl && !isSafeImageUrl(imageUrl)) {
    return fail("Alamat gambar utama tidak valid.");
  }
  if (mobileImageUrl && !isSafeImageUrl(mobileImageUrl)) {
    return fail("Alamat gambar mobile tidak valid.");
  }
  if (imageAlt.length > BANNER_LIMITS.imageAlt) {
    return fail(`Teks alt maksimal ${BANNER_LIMITS.imageAlt} karakter.`);
  }
  if ((imageUrl || mobileImageUrl) && !imageAlt && !config.decorativeImage) {
    return fail("Teks alt wajib diisi bila gambar diganti.");
  }
  if (ctaLabel.length > BANNER_LIMITS.ctaLabel) {
    return fail(`Label tombol maksimal ${BANNER_LIMITS.ctaLabel} karakter.`);
  }
  if (ctaHref.length > BANNER_LIMITS.ctaHref) {
    return fail(`Tujuan tombol maksimal ${BANNER_LIMITS.ctaHref} karakter.`);
  }
  if (Boolean(ctaLabel) !== Boolean(ctaHref)) {
    return fail("Label tombol dan tujuan tombol harus diisi berpasangan (atau dikosongkan keduanya).");
  }
  if (ctaHref && !isSafeCtaHref(ctaHref)) {
    return fail(
      "Tujuan tombol harus berupa path internal (mis. /menu), anchor (mis. #home_whats_new), atau alamat https://….",
    );
  }

  return {
    ok: true,
    data: {
      // Judul kosong → label admin bawaan, supaya frontend memakai teks hardcode.
      title: title || BANNER_DEFAULT_TITLE[key],
      subtitle: subtitle || null,
      imageUrl: imageUrl || null,
      mobileImageUrl: mobileImageUrl || null,
      imageAlt: imageAlt || null,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
    },
  };
}

// ---------------------------------------------------------------------------
// Penggabungan dengan nilai bawaan (frontend)
// ---------------------------------------------------------------------------

/** Bentuk minimal section yang dibaca `resolveBanner`. */
export type BannerSectionLike = {
  key: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type BannerDefaults = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type ResolvedBanner = BannerDefaults & {
  /** null → tidak ada gambar khusus mobile; render `<img>` biasa. */
  mobileImageUrl: string | null;
};

/**
 * Gabungkan isian admin dengan nilai bawaan. Field kosong/null → bawaan.
 *
 * - Judul hanya diambil bila bukan label admin (`displayTitle`).
 * - Tombol hanya diganti bila label DAN tujuan sama-sama terisi dan tujuan
 *   lolos `isSafeCtaHref` (pertahanan kedua bila DB diisi di luar admin).
 * - Alt: isian admin bila ada; bila gambar diganti tanpa alt (hero
 *   dekoratif) → `""`; bila gambar bawaan → alt bawaan.
 */
export function resolveBanner(
  section: BannerSectionLike | null | undefined,
  defaults: BannerDefaults,
): ResolvedBanner {
  if (!section) return { ...defaults, mobileImageUrl: null };

  const subtitle = clean(section.subtitle);
  const imageUrl = clean(section.imageUrl);
  const mobileImageUrl = clean(section.mobileImageUrl);
  const imageAlt = clean(section.imageAlt);
  const ctaLabel = clean(section.ctaLabel);
  const ctaHref = clean(section.ctaHref);
  const useImage = imageUrl && isSafeImageUrl(imageUrl);
  const useCta = ctaLabel && ctaHref && isSafeCtaHref(ctaHref);

  return {
    title: displayTitle(section.key, section.title) ?? defaults.title,
    subtitle: subtitle || defaults.subtitle,
    imageUrl: useImage ? imageUrl : defaults.imageUrl,
    imageAlt: imageAlt || (useImage ? "" : defaults.imageAlt),
    ctaLabel: useCta ? ctaLabel : defaults.ctaLabel,
    ctaHref: useCta ? ctaHref : defaults.ctaHref,
    mobileImageUrl: mobileImageUrl && isSafeImageUrl(mobileImageUrl) ? mobileImageUrl : null,
  };
}

/** Nilai bawaan hero & booking banner. */
export const HERO_DEFAULTS: BannerDefaults = {
  title: "Relax. Refresh. (Repeat).",
  subtitle: "Massage • Spa • Corporate Wellness",
  imageUrl: asset("img/kama/incense-smoke-poster.jpg"),
  imageAlt: "",
  ctaLabel: "Book Now",
  ctaHref: "/contact",
};

export const BOOKING_BANNER_DEFAULTS: BannerDefaults = {
  title: "Have any questions? Drop us a line.",
  subtitle: "",
  imageUrl: "",
  imageAlt: "",
  ctaLabel: "Get In Touch",
  ctaHref: "/contact",
};

/** Media query `<source>` gambar mobile (di bawah breakpoint `md` Tailwind). */
export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
