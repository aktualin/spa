/**
 * Aturan modul Kontak & Umum (`SiteSettings`): pembacaan baris database,
 * normalisasi & validasi isian admin, serta penerapan pengaturan ke kartu
 * lokasi dan ikon sosial di footer.
 *
 * Tanpa nilai bawaan statis: kolom yang belum diisi admin dikembalikan kosong
 * supaya halaman publik menampilkan empty state, bukan alamat atau nomor
 * hardcode yang diam-diam menimpa data admin.
 *
 * Modul murni (tanpa I/O, tanpa Next/Prisma) supaya bisa diuji langsung
 * dengan `node --test`.
 */
import { z } from "zod";

import { type Location } from "../../data/content.ts";
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";

/* ------------------------------------------------------------------ */
/* Tipe data                                                           */
/* ------------------------------------------------------------------ */

/** Pengaturan situs yang dipakai halaman publik (sudah digabung fallback). */
export type SiteSettings = {
  address: string;
  openingHours: string[];
  /** Digit saja, format internasional (mis. `6281316052040`). */
  whatsappNumber: string;
  email: string;
  phone: string;
  instagramUrl: string;
  instagramUsername: string;
  tiktokUrl: string;
  facebookUrl: string;
  freshaUrl: string;
  mapsEmbedUrl: string;
  ga4MeasurementId: string;
  /** Tagline di footer. */
  footerTagline: string;
  /** CTA membership di footer. */
  footerMembershipTitle: string;
  footerMembershipLearnLabel: string;
  footerMembershipJoinLabel: string;
  /** Blok partnership di footer. */
  partnershipIntro: string;
  partnershipEmail: string;
  /** Catatan harga di halaman menu. */
  priceDisclaimer: string;
  /** Label & tujuan tombol Book Now di header; kosong → tombol disembunyikan. */
  bookNowLabel: string;
  bookNowHref: string;
  /** Halaman scan menu book, berurutan. */
  menuScanUrls: string[];
  /** Berkas PDF menu yang bisa diunduh. */
  menuPdfUrl: string;
};

/**
 * Kolom `SiteSettings` milik modul Kontak & Umum. Kolom SEO (`gscVerification`,
 * `faviconUrl`, `defaultOgImageUrl`) sengaja tidak ada di sini: diedit modul SEO.
 */
export type SiteSettingsRow = {
  address: string | null;
  mapsEmbedUrl: string | null;
  openingHours: string[];
  whatsappNumber: string | null;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  instagramUsername: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  freshaUrl: string | null;
  ga4MeasurementId: string | null;
  footerTagline: string | null;
  footerMembershipTitle: string | null;
  footerMembershipLearnLabel: string | null;
  footerMembershipJoinLabel: string | null;
  partnershipIntro: string | null;
  partnershipEmail: string | null;
  priceDisclaimer: string | null;
  bookNowLabel: string | null;
  bookNowHref: string | null;
  menuScanUrls: string[];
  menuPdfUrl: string | null;
};

/** Nilai yang ditulis ke database oleh form Kontak & Umum. */
export type SiteSettingsWrite = SiteSettingsRow;

/* ------------------------------------------------------------------ */
/* Nilai kosong                                                        */
/* ------------------------------------------------------------------ */

/**
 * Pengaturan kosong — dipakai saat baris `SiteSettings` belum ada atau DB
 * tidak terjangkau. Halaman publik menyembunyikan bagian yang nilainya kosong.
 */
export function emptySiteSettings(): SiteSettings {
  return {
    address: "",
    openingHours: [],
    whatsappNumber: "",
    email: "",
    phone: "",
    instagramUrl: "",
    instagramUsername: "",
    tiktokUrl: "",
    facebookUrl: "",
    freshaUrl: "",
    mapsEmbedUrl: "",
    ga4MeasurementId: "",
    footerTagline: "",
    footerMembershipTitle: "",
    footerMembershipLearnLabel: "",
    footerMembershipJoinLabel: "",
    partnershipIntro: "",
    partnershipEmail: "",
    priceDisclaimer: "",
    bookNowLabel: "",
    bookNowHref: "",
    menuScanUrls: [],
    menuPdfUrl: "",
  };
}

/* ------------------------------------------------------------------ */
/* Normalisasi & validasi (fungsi murni)                               */
/* ------------------------------------------------------------------ */

/**
 * Normalisasi nomor WhatsApp ke format internasional digit saja.
 *
 * - `0813…` → `62813…`; `813…` → `62813…`; `+62 813…` / `62813…` tetap.
 * - Awalan internasional `00` dibuang (`0062…` → `62…`).
 * - Nomor negara lain yang ditulis dengan `+` dipertahankan apa adanya.
 *
 * Mengembalikan `null` bila ada karakter selain angka, `+`, spasi, titik,
 * tanda hubung, atau kurung, atau bila panjang hasilnya di luar 8–15 digit.
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  const raw = input.trim();
  if (!raw || !/^\+?[0-9\s().-]+$/.test(raw)) return null;

  let digits = raw.replace(/\D/g, "");
  const international = raw.startsWith("+");
  if (!international) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
    else if (digits.startsWith("8")) digits = `62${digits}`;
  }

  if (digits.startsWith("0")) return null;
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/**
 * Format tampilan nomor: `6281316052040` → `+62 813-1605-2040`.
 * Nomor non-Indonesia cukup diberi awalan `+`.
 */
export function formatPhoneDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "";
  if (!clean.startsWith("62") || clean.length < 9) return `+${clean}`;
  const local = clean.slice(2);
  const groups = [local.slice(0, 3), local.slice(3, 7), local.slice(7)].filter(
    Boolean,
  );
  return `+62 ${groups.join("-")}`;
}

/** Nomor telepon biasa: boleh angka, `+`, spasi, titik, tanda hubung, kurung. */
export function isValidPhone(input: string): boolean {
  const raw = input.trim();
  if (!/^\+?[0-9\s().-]+$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "").length;
  return digits >= 8 && digits <= 15;
}

const PLATFORM_HOSTS = {
  instagram: ["instagram.com", "instagr.am"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.com", "fb.me"],
  fresha: ["fresha.com"],
} as const;

export type SocialPlatform = keyof typeof PLATFORM_HOSTS;

/** true bila `input` URL `https://` lengkap (host memuat titik). */
export function isHttpsUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** true bila URL `https://` dan domainnya milik platform tersebut. */
export function isPlatformUrl(input: string, platform: SocialPlatform): boolean {
  if (!isHttpsUrl(input)) return false;
  const host = new URL(input.trim()).hostname.toLowerCase();
  return PLATFORM_HOSTS[platform].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

const MAPS_EMBED_PREFIX = "https://www.google.com/maps/embed?";

/**
 * Ambil URL embed Google Maps dari isian admin.
 *
 * Admin boleh menempel URL langsung atau seluruh kode `<iframe …>` dari menu
 * Share → Embed a map; untuk iframe hanya atribut `src` yang diambil. Hasilnya
 * wajib diawali `https://www.google.com/maps/embed?` dan tidak memuat HTML.
 * Mengembalikan `null` bila tidak valid.
 */
export function parseMapsEmbedInput(input: string): string | null {
  let value = input.trim();
  if (!value) return null;

  if (/<\s*iframe\b/i.test(value)) {
    const match = value.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (!match) return null;
    value = (match[1] ?? match[2] ?? "").trim().replace(/&amp;/g, "&");
  }

  if (/[<>"'\s]/.test(value)) return null;
  if (!value.startsWith(MAPS_EMBED_PREFIX)) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "www.google.com" ||
      url.pathname !== "/maps/embed" ||
      url.search.length <= 1
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return value;
}

const INSTAGRAM_USERNAME = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9._]{1,30}$/;

/**
 * Normalisasi username Instagram: buang `@` di depan, huruf kecil.
 * Mengembalikan `null` bila tidak sesuai pola username Instagram
 * (huruf, angka, titik, garis bawah; maks. 30 karakter; titik tidak di awal,
 * akhir, atau berurutan).
 */
export function normalizeInstagramUsername(input: string): string | null {
  const value = input.trim().replace(/^@+/, "").toLowerCase();
  if (!value || !INSTAGRAM_USERNAME.test(value)) return null;
  return value;
}

/** `https://www.instagram.com/kama__spa/` → `kama__spa` (atau `null`). */
export function instagramUsernameFromUrl(input: string): string | null {
  if (!isPlatformUrl(input, "instagram")) return null;
  const segment = new URL(input.trim()).pathname.split("/").filter(Boolean)[0];
  return segment ? normalizeInstagramUsername(segment) : null;
}

const GA4_ID = /^G-[A-Z0-9]{6,12}$/;

/** Normalisasi Measurement ID GA4 (`g-abc…` → `G-ABC…`); `null` bila salah format. */
export function normalizeGa4Id(input: string): string | null {
  const value = input.trim().toUpperCase();
  return GA4_ID.test(value) ? value : null;
}

export const MAX_OPENING_HOURS = 14;
export const MAX_OPENING_HOURS_LENGTH = 120;

/** Rapikan baris jam operasional: trim, buang baris kosong, urutan dipertahankan. */
export function normalizeOpeningHours(lines: readonly string[]): string[] {
  return lines.map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/** Tautan rute Google Maps ke sebuah alamat. */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/* ------------------------------------------------------------------ */
/* Skema form admin                                                    */
/* ------------------------------------------------------------------ */

/** Isian mentah form admin (semua string, jam operasional berupa daftar). */
export type SiteSettingsInput = {
  address: string;
  openingHours: string[];
  whatsappNumber: string;
  email: string;
  phone: string;
  instagramUrl: string;
  instagramUsername: string;
  tiktokUrl: string;
  facebookUrl: string;
  freshaUrl: string;
  mapsEmbedUrl: string;
  ga4MeasurementId: string;
  footerTagline: string;
  footerMembershipTitle: string;
  footerMembershipLearnLabel: string;
  footerMembershipJoinLabel: string;
  partnershipIntro: string;
  partnershipEmail: string;
  priceDisclaimer: string;
  bookNowLabel: string;
  bookNowHref: string;
  menuScanUrls: string[];
  menuPdfUrl: string;
};

export const MAX_FOOTER_TAGLINE = 400;
export const MAX_FOOTER_MEMBERSHIP_TITLE = 160;
export const MAX_FOOTER_MEMBERSHIP_LABEL = 60;
export const MAX_PARTNERSHIP_INTRO = 120;
export const MAX_PRICE_DISCLAIMER = 300;
export const MAX_BOOK_NOW_LABEL = 40;
export const MAX_MENU_SCANS = 30;

/** Rapikan daftar URL gambar: trim, buang yang kosong, urutan dipertahankan. */
export function normalizeMenuScanUrls(urls: readonly string[]): string[] {
  return urls.map((url) => url.trim()).filter(Boolean);
}

const blank = (value: string) => value.trim() === "";

function optionalPlatformUrl(platform: SocialPlatform, label: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || isHttpsUrl(value),
      `${label}: isi alamat lengkap yang diawali https://`,
    )
    .refine(
      (value) => blank(value) || isPlatformUrl(value, platform),
      `${label}: alamat harus dari domain ${PLATFORM_HOSTS[platform][0]}.`,
    );
}

export const siteSettingsInputSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi.")
    .max(300, "Alamat terlalu panjang (maks. 300 karakter)."),
  openingHours: z
    .array(
      z
        .string()
        .max(
          MAX_OPENING_HOURS_LENGTH,
          `Satu baris jam operasional maks. ${MAX_OPENING_HOURS_LENGTH} karakter.`,
        ),
    )
    .transform(normalizeOpeningHours)
    .refine((lines) => lines.length > 0, "Isi minimal satu baris jam operasional.")
    .refine(
      (lines) => lines.length <= MAX_OPENING_HOURS,
      `Jam operasional maks. ${MAX_OPENING_HOURS} baris.`,
    ),
  whatsappNumber: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi.")
    .refine(
      (value) => normalizeWhatsAppNumber(value) !== null,
      "Nomor WhatsApp tidak valid. Tulis 08xx atau +62xx (8–15 digit, hanya angka).",
    )
    .transform((value) => normalizeWhatsAppNumber(value) as string),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .pipe(z.email("Format email tidak valid."))
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || isValidPhone(value),
      "Nomor telepon tidak valid (8–15 digit; boleh +, spasi, atau tanda hubung).",
    ),
  instagramUrl: optionalPlatformUrl("instagram", "Instagram"),
  instagramUsername: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || normalizeInstagramUsername(value) !== null,
      "Username Instagram tidak valid. Tulis tanpa @, hanya huruf, angka, titik, dan garis bawah (maks. 30).",
    )
    .transform((value) => (blank(value) ? "" : (normalizeInstagramUsername(value) as string))),
  tiktokUrl: optionalPlatformUrl("tiktok", "TikTok"),
  facebookUrl: optionalPlatformUrl("facebook", "Facebook"),
  freshaUrl: optionalPlatformUrl("fresha", "Fresha"),
  mapsEmbedUrl: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || parseMapsEmbedInput(value) !== null,
      "URL embed Google Maps harus diawali https://www.google.com/maps/embed? — atau tempel kode <iframe> dari Google Maps.",
    )
    .transform((value) => (blank(value) ? "" : (parseMapsEmbedInput(value) as string))),
  ga4MeasurementId: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || normalizeGa4Id(value) !== null,
      "Measurement ID GA4 harus berformat G-XXXXXXXXXX.",
    )
    .transform((value) => (blank(value) ? "" : (normalizeGa4Id(value) as string))),
  footerTagline: z
    .string()
    .trim()
    .max(MAX_FOOTER_TAGLINE, `Tagline footer maks. ${MAX_FOOTER_TAGLINE} karakter.`),
  footerMembershipTitle: z
    .string()
    .trim()
    .max(
      MAX_FOOTER_MEMBERSHIP_TITLE,
      `Judul CTA membership maks. ${MAX_FOOTER_MEMBERSHIP_TITLE} karakter.`,
    ),
  footerMembershipLearnLabel: z
    .string()
    .trim()
    .max(
      MAX_FOOTER_MEMBERSHIP_LABEL,
      `Label tombol “Learn More” maks. ${MAX_FOOTER_MEMBERSHIP_LABEL} karakter.`,
    ),
  footerMembershipJoinLabel: z
    .string()
    .trim()
    .max(
      MAX_FOOTER_MEMBERSHIP_LABEL,
      `Label tombol “Join” maks. ${MAX_FOOTER_MEMBERSHIP_LABEL} karakter.`,
    ),
  partnershipIntro: z
    .string()
    .trim()
    .max(
      MAX_PARTNERSHIP_INTRO,
      `Kalimat partnership maks. ${MAX_PARTNERSHIP_INTRO} karakter.`,
    ),
  partnershipEmail: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || z.email().safeParse(value).success,
      "Email partnership tidak valid.",
    )
    .transform((value) => value.toLowerCase()),
  priceDisclaimer: z
    .string()
    .trim()
    .max(
      MAX_PRICE_DISCLAIMER,
      `Catatan harga maks. ${MAX_PRICE_DISCLAIMER} karakter.`,
    ),
  bookNowLabel: z
    .string()
    .trim()
    .max(MAX_BOOK_NOW_LABEL, `Label Book Now maks. ${MAX_BOOK_NOW_LABEL} karakter.`),
  bookNowHref: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || isSafeCtaHref(value),
      "Tujuan Book Now harus path internal (/contact), anchor (#booking), atau URL https://.",
    ),
  menuScanUrls: z
    .array(z.string())
    .transform(normalizeMenuScanUrls)
    .refine(
      (urls) => urls.every((url) => isSafeImageUrl(url)),
      "Setiap halaman menu harus berupa URL gambar https:// atau path internal.",
    )
    .refine(
      (urls) => urls.length <= MAX_MENU_SCANS,
      `Halaman menu maks. ${MAX_MENU_SCANS} gambar.`,
    ),
  menuPdfUrl: z
    .string()
    .trim()
    .refine(
      (value) => blank(value) || (isSafeCtaHref(value) && value.startsWith("https://")),
      "PDF menu harus berupa URL https:// (unggah ke bucket S3 atau tautan Google Drive).",
    ),
});

export type SiteSettingsParsed = z.output<typeof siteSettingsInputSchema>;

/** Hasil validasi → data yang ditulis (string kosong menjadi `null`). */
export function toSiteSettingsWrite(parsed: SiteSettingsParsed): SiteSettingsWrite {
  const orNull = (value: string) => (value.trim() ? value.trim() : null);
  return {
    address: parsed.address,
    openingHours: parsed.openingHours,
    whatsappNumber: parsed.whatsappNumber,
    email: parsed.email,
    phone: orNull(parsed.phone),
    instagramUrl: orNull(parsed.instagramUrl),
    instagramUsername: orNull(parsed.instagramUsername),
    tiktokUrl: orNull(parsed.tiktokUrl),
    facebookUrl: orNull(parsed.facebookUrl),
    freshaUrl: orNull(parsed.freshaUrl),
    mapsEmbedUrl: orNull(parsed.mapsEmbedUrl),
    ga4MeasurementId: orNull(parsed.ga4MeasurementId),
    footerTagline: orNull(parsed.footerTagline),
    footerMembershipTitle: orNull(parsed.footerMembershipTitle),
    footerMembershipLearnLabel: orNull(parsed.footerMembershipLearnLabel),
    footerMembershipJoinLabel: orNull(parsed.footerMembershipJoinLabel),
    partnershipIntro: orNull(parsed.partnershipIntro),
    partnershipEmail: orNull(parsed.partnershipEmail),
    priceDisclaimer: orNull(parsed.priceDisclaimer),
    bookNowLabel: orNull(parsed.bookNowLabel),
    bookNowHref: orNull(parsed.bookNowHref),
    menuScanUrls: parsed.menuScanUrls,
    menuPdfUrl: orNull(parsed.menuPdfUrl),
  };
}

/* ------------------------------------------------------------------ */
/* Penggabungan database + fallback                                    */
/* ------------------------------------------------------------------ */

/**
 * Baris database → nilai yang dipakai halaman publik.
 *
 * Tanpa baris (belum pernah disimpan / DB gagal) → seluruh nilai kosong, dan
 * halaman menampilkan empty state. Kolom yang kosong atau tidak valid juga
 * tetap kosong: tidak ada nilai hardcode yang menimpa data admin.
 * Username Instagram kosong masih boleh diturunkan dari URL Instagram karena
 * keduanya data admin yang sama.
 */
export function mergeSiteSettings(row: SiteSettingsRow | null): SiteSettings {
  if (!row) return emptySiteSettings();

  const text = (value: string | null | undefined) => value?.trim() ?? "";
  const optionalUrl = (value: string | null) =>
    isHttpsUrl(text(value)) ? text(value) : "";
  const instagramUrl = optionalUrl(row.instagramUrl);

  return {
    address: text(row.address),
    openingHours: normalizeOpeningHours(row.openingHours ?? []),
    whatsappNumber: normalizeWhatsAppNumber(text(row.whatsappNumber)) ?? "",
    email: text(row.email),
    phone: text(row.phone),
    instagramUrl,
    instagramUsername:
      normalizeInstagramUsername(text(row.instagramUsername)) ??
      instagramUsernameFromUrl(instagramUrl) ??
      "",
    tiktokUrl: optionalUrl(row.tiktokUrl),
    facebookUrl: optionalUrl(row.facebookUrl),
    freshaUrl: optionalUrl(row.freshaUrl),
    mapsEmbedUrl: parseMapsEmbedInput(text(row.mapsEmbedUrl)) ?? "",
    ga4MeasurementId: normalizeGa4Id(text(row.ga4MeasurementId)) ?? "",
    footerTagline: text(row.footerTagline),
    footerMembershipTitle: text(row.footerMembershipTitle),
    footerMembershipLearnLabel: text(row.footerMembershipLearnLabel),
    footerMembershipJoinLabel: text(row.footerMembershipJoinLabel),
    partnershipIntro: text(row.partnershipIntro),
    partnershipEmail: text(row.partnershipEmail),
    priceDisclaimer: text(row.priceDisclaimer),
    bookNowLabel: text(row.bookNowLabel),
    // Tujuan yang tidak aman diperlakukan kosong supaya tombolnya disembunyikan,
    // bukan dirender dengan tautan yang bisa menyesatkan.
    bookNowHref: isSafeCtaHref(text(row.bookNowHref)) ? text(row.bookNowHref) : "",
    menuScanUrls: normalizeMenuScanUrls(row.menuScanUrls ?? []).filter(isSafeImageUrl),
    menuPdfUrl: isSafeCtaHref(text(row.menuPdfUrl)) ? text(row.menuPdfUrl) : "",
  };
}

/** Field yang di form admin diisi dari nilai bawaan karena kolomnya kosong. */
export type FormDefaults = {
  values: SiteSettingsInput;
  /** Label field yang terisi otomatis dari tampilan situs saat ini. */
  prefilled: string[];
  /** true bila baris `SiteSettings` belum ada sama sekali. */
  noRow: boolean;
};

/**
 * Nilai awal form admin: isi database, atau — bila kolom wajib kosong —
 * nilai yang saat ini tampil di situs, disertai daftar field yang terisi
 * otomatis untuk pemberitahuan kuning.
 */
export function siteSettingsFormDefaults(row: SiteSettingsRow | null): FormDefaults {
  const shown = mergeSiteSettings(row);
  const text = (value: string | null | undefined) => value?.trim() ?? "";
  const prefilled: string[] = [];

  if (!row) {
    return {
      values: { ...shown, openingHours: [...shown.openingHours] },
      prefilled: [],
      noRow: true,
    };
  }

  const pick = (stored: string, displayed: string, label: string) => {
    if (stored) return stored;
    if (displayed) prefilled.push(label);
    return displayed;
  };

  const hours = normalizeOpeningHours(row.openingHours ?? []);
  if (hours.length === 0) prefilled.push("Jam operasional");

  return {
    values: {
      address: pick(text(row.address), shown.address, "Alamat"),
      openingHours: hours.length > 0 ? hours : [...shown.openingHours],
      whatsappNumber: pick(text(row.whatsappNumber), shown.whatsappNumber, "Nomor WhatsApp"),
      email: pick(text(row.email), shown.email, "Email"),
      phone: text(row.phone),
      instagramUrl: text(row.instagramUrl),
      instagramUsername: pick(
        text(row.instagramUsername),
        text(row.instagramUrl) ? shown.instagramUsername : "",
        "Username Instagram",
      ),
      tiktokUrl: text(row.tiktokUrl),
      facebookUrl: text(row.facebookUrl),
      freshaUrl: text(row.freshaUrl),
      mapsEmbedUrl: text(row.mapsEmbedUrl),
      ga4MeasurementId: text(row.ga4MeasurementId),
      footerTagline: text(row.footerTagline),
      footerMembershipTitle: text(row.footerMembershipTitle),
      footerMembershipLearnLabel: text(row.footerMembershipLearnLabel),
      footerMembershipJoinLabel: text(row.footerMembershipJoinLabel),
      partnershipIntro: text(row.partnershipIntro),
      partnershipEmail: text(row.partnershipEmail),
      priceDisclaimer: text(row.priceDisclaimer),
      bookNowLabel: text(row.bookNowLabel),
      bookNowHref: text(row.bookNowHref),
      menuScanUrls: normalizeMenuScanUrls(row.menuScanUrls ?? []),
      menuPdfUrl: text(row.menuPdfUrl),
    },
    prefilled,
    noRow: false,
  };
}

/* ------------------------------------------------------------------ */
/* Penerapan ke tampilan publik                                        */
/* ------------------------------------------------------------------ */

/** Cabang utama yang alamat & petanya diatur lewat Kontak & Umum. */
export const FLAGSHIP_LOCATION_SLUG = "south-jakarta";

/**
 * Terapkan pengaturan situs ke daftar lokasi halaman kontak.
 *
 * - Semua cabang: nomor (tampilan) mengikuti nomor WhatsApp, jam operasional
 *   mengikuti pengaturan — data statis cabang memang memakai nilai yang sama.
 * - Cabang utama: alamat, tautan rute, dan embed peta mengikuti pengaturan.
 *
 * `hours` berisi baris-baris jam operasional yang digabung dengan `\n`.
 */
export function applySiteSettingsToLocations(
  locations: readonly Location[],
  settings: SiteSettings,
): Location[] {
  const phone = formatPhoneDisplay(settings.whatsappNumber);
  const hours = settings.openingHours.join("\n");
  return locations.map((loc) => {
    const base = { ...loc, phone: phone || loc.phone, hours: hours || loc.hours };
    if (loc.slug !== FLAGSHIP_LOCATION_SLUG) return base;
    // Alamat kosong di pengaturan tidak boleh mengosongkan kartu cabang.
    if (!settings.address) return { ...base, mapEmbed: settings.mapsEmbedUrl || loc.mapEmbed };
    return {
      ...base,
      address: settings.address,
      mapDirections:
        settings.address === loc.address ? loc.mapDirections : directionsUrl(settings.address),
      mapEmbed: settings.mapsEmbedUrl || loc.mapEmbed,
    };
  });
}

export type FooterSocial = {
  label: "Instagram" | "TikTok" | "Facebook" | "Email";
  href: string;
  icon: "instagram" | "tiktok" | "facebook" | "email";
};

/**
 * Ikon "Connect with us" di footer: Instagram, TikTok, Facebook, Email —
 * yang kosong tidak ditampilkan. Urutan & label sama dengan desain lama.
 */
export function footerSocials(settings: SiteSettings): FooterSocial[] {
  const items: FooterSocial[] = [];
  if (settings.instagramUrl) {
    items.push({ label: "Instagram", href: settings.instagramUrl, icon: "instagram" });
  }
  if (settings.tiktokUrl) {
    items.push({ label: "TikTok", href: settings.tiktokUrl, icon: "tiktok" });
  }
  if (settings.facebookUrl) {
    items.push({ label: "Facebook", href: settings.facebookUrl, icon: "facebook" });
  }
  if (settings.email) {
    items.push({ label: "Email", href: `mailto:${settings.email}`, icon: "email" });
  }
  return items;
}
