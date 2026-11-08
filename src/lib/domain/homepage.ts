/**
 * Aturan homepage di luar banner: section yang tampil secara bawaan, dan
 * kartu highlight (`HomepageHighlight`) di section "What's New".
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 *
 * ## Kartu highlight & fallback statis
 *
 * Section "What's New" menampilkan kartu highlight dari database dengan
 * markup yang sama persis dengan kartu statis lama (`journalPosts` di
 * `src/data/content.ts`). Kartu statis HANYA dipakai bila tabel highlight
 * masih kosong (belum pernah diisi admin). Begitu ada satu baris saja, yang
 * tampil adalah highlight yang lolos `isHighlightVisible` — meskipun hasilnya
 * nol (mis. semua masih draf) — supaya draf tidak memunculkan kembali konten
 * lama secara diam-diam.
 */
import { isPromoActive } from "./visibility.ts";
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";

// ---------------------------------------------------------------------------
// Section bawaan
// ---------------------------------------------------------------------------

/**
 * Section yang tampil walaupun barisnya belum ada di database (komposisi
 * homepage lama + footer). Saat admin menambahkan barisnya, section ini
 * dibuat dalam keadaan AKTIF supaya homepage tidak berubah.
 */
export const DEFAULT_VISIBLE_SECTION_KEYS = [
  "hero",
  "membership-banner",
  "whats-new",
  "reviews",
  "brand-intro",
  "socials",
  "booking-banner",
  "footer",
] as const;

export function isDefaultVisibleSection(key: string): boolean {
  return (DEFAULT_VISIBLE_SECTION_KEYS as readonly string[]).includes(key);
}

/**
 * Section yang posisinya tetap (tidak ikut diurutkan): footer selalu di
 * paling bawah halaman, di luar `<main>`.
 */
export const FIXED_POSITION_SECTION_KEYS = ["footer"] as const;

export function isFixedPositionSection(key: string): boolean {
  return (FIXED_POSITION_SECTION_KEYS as readonly string[]).includes(key);
}

/**
 * Section yang hanya punya tombol tampil/sembunyi (tanpa isian teks/gambar).
 * Footer berisi data global situs (Pengaturan & Menu Navigasi).
 */
export function isToggleOnlySection(key: string): boolean {
  return key === "footer";
}

// ---------------------------------------------------------------------------
// Kartu highlight
// ---------------------------------------------------------------------------

/** Batas panjang isian highlight (karakter). */
export const HIGHLIGHT_LIMITS = {
  eyebrow: 40,
  title: 160,
  imageAlt: 200,
  href: 500,
  ctaLabel: 40,
} as const;

/** Label tombol bawaan kartu — sama dengan kartu statis lama. */
export const HIGHLIGHT_DEFAULT_CTA = "Learn More";

/** Bentuk satu kartu di section "What's New" (dipakai data statis & DB). */
export type HighlightCard = {
  key: string;
  /** null → kartu tanpa tautan (tanpa teks tombol). */
  href: string | null;
  /** null → kotak gambar kosong berwarna latar. */
  image: string | null;
  imageAlt: string;
  tag: string;
  title: string;
  ctaLabel: string;
};

/** Bentuk minimal baris `HomepageHighlight` yang dibaca modul ini. */
export type HighlightRowLike = {
  id: string;
  eyebrow?: string | null;
  title: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string | null;
  ctaLabel?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isPublished: boolean;
  sortOrder: number;
};

/** Highlight tampil bila dipublikasikan dan berada di dalam periodenya. */
export function isHighlightVisible(
  row: Pick<HighlightRowLike, "isPublished" | "startDate" | "endDate">,
  now: Date = new Date(),
): boolean {
  return isPromoActive(
    { isPublished: row.isPublished, startDate: row.startDate, endDate: row.endDate },
    now,
  );
}

export type HighlightStatus = "Draf" | "Terjadwal" | "Berakhir" | "Tayang";

/** Status untuk ditampilkan di daftar admin. */
export function highlightStatus(
  row: Pick<HighlightRowLike, "isPublished" | "startDate" | "endDate">,
  now: Date = new Date(),
): HighlightStatus {
  if (!row.isPublished) return "Draf";
  if (row.startDate && row.startDate.getTime() > now.getTime()) return "Terjadwal";
  if (row.endDate && row.endDate.getTime() < now.getTime()) return "Berakhir";
  return "Tayang";
}

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** Baris DB → kartu. Tautan/gambar yang tidak aman diabaikan (pertahanan kedua). */
export function highlightToCard(row: HighlightRowLike): HighlightCard {
  const href = clean(row.href);
  const image = clean(row.imageUrl);
  const ctaLabel = clean(row.ctaLabel);
  return {
    key: row.id,
    href: href && isSafeCtaHref(href) ? href : null,
    image: image && isSafeImageUrl(image) ? image : null,
    imageAlt: clean(row.imageAlt),
    tag: clean(row.eyebrow),
    title: row.title.trim(),
    ctaLabel: ctaLabel || HIGHLIGHT_DEFAULT_CTA,
  };
}

/**
 * Kartu yang ditampilkan. `null` berarti tabel highlight kosong → pemanggil
 * memakai kartu statis lama. Urutan: `sortOrder` naik (stabil).
 */
export function selectHighlightCards(
  rows: HighlightRowLike[],
  now: Date = new Date(),
): HighlightCard[] | null {
  if (rows.length === 0) return null;
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => isHighlightVisible(row, now))
    .sort((a, b) => a.row.sortOrder - b.row.sortOrder || a.index - b.index)
    .map(({ row }) => highlightToCard(row));
}

// ---------------------------------------------------------------------------
// Validasi isian form admin
// ---------------------------------------------------------------------------

export type HighlightRawInput = {
  eyebrow?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string | null;
  ctaLabel?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isPublished?: boolean;
};

export type HighlightData = {
  eyebrow: string | null;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  href: string | null;
  ctaLabel: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isPublished: boolean;
};

export type HighlightValidation =
  | { ok: true; data: HighlightData }
  | { ok: false; error: string };

export function validateHighlightInput(raw: HighlightRawInput): HighlightValidation {
  const fail = (error: string): HighlightValidation => ({ ok: false, error });

  const eyebrow = clean(raw.eyebrow);
  const title = clean(raw.title);
  const imageUrl = clean(raw.imageUrl);
  const imageAlt = clean(raw.imageAlt);
  const href = clean(raw.href);
  const ctaLabel = clean(raw.ctaLabel);
  const startDate = raw.startDate ?? null;
  const endDate = raw.endDate ?? null;

  if (!title) return fail("Judul highlight wajib diisi.");
  if (title.length > HIGHLIGHT_LIMITS.title) {
    return fail(`Judul maksimal ${HIGHLIGHT_LIMITS.title} karakter.`);
  }
  if (eyebrow.length > HIGHLIGHT_LIMITS.eyebrow) {
    return fail(`Label kategori maksimal ${HIGHLIGHT_LIMITS.eyebrow} karakter.`);
  }
  if (imageUrl && !isSafeImageUrl(imageUrl)) {
    return fail("Alamat gambar tidak valid.");
  }
  if (imageAlt.length > HIGHLIGHT_LIMITS.imageAlt) {
    return fail(`Teks alt maksimal ${HIGHLIGHT_LIMITS.imageAlt} karakter.`);
  }
  if (href.length > HIGHLIGHT_LIMITS.href) {
    return fail(`Tujuan tautan maksimal ${HIGHLIGHT_LIMITS.href} karakter.`);
  }
  if (href && !isSafeCtaHref(href)) {
    return fail(
      "Tujuan tautan harus berupa path internal (mis. /menu), anchor (mis. #home_whats_new), atau alamat https://….",
    );
  }
  if (ctaLabel.length > HIGHLIGHT_LIMITS.ctaLabel) {
    return fail(`Label tombol maksimal ${HIGHLIGHT_LIMITS.ctaLabel} karakter.`);
  }
  if (ctaLabel && !href) {
    return fail("Label tombol hanya dipakai bila tujuan tautan diisi.");
  }
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    return fail("Tanggal berakhir harus sama dengan atau setelah tanggal mulai.");
  }

  return {
    ok: true,
    data: {
      eyebrow: eyebrow || null,
      title,
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      href: href || null,
      ctaLabel: ctaLabel || null,
      startDate,
      endDate,
      isPublished: raw.isPublished ?? false,
    },
  };
}

/**
 * Urutan baru setelah memindahkan `id` satu langkah ke atas/bawah. Hasilnya
 * daftar id berurutan (indeks = `sortOrder` baru), atau null bila tidak
 * berubah. Penomoran ulang 0..n menghindari masalah `sortOrder` kembar.
 */
export function reorderIds(
  orderedIds: string[],
  id: string,
  direction: "up" | "down",
): string[] | null {
  const index = orderedIds.indexOf(id);
  if (index === -1) return null;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= orderedIds.length) return null;
  const next = [...orderedIds];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// ---------------------------------------------------------------------------
// Statistik Brand Intro, ulasan, dan feed Instagram
// ---------------------------------------------------------------------------
//
// Ketiganya memakai pola fallback yang sama dengan highlight: tabel KOSONG
// (belum pernah diisi) → pemanggil memakai data statis lama; ada baris tetapi
// tak satu pun terbit → section tampil tanpa item (draf tidak diam-diam
// memunculkan konten lama).

/** Batas isian statistik, ulasan, dan feed Instagram (karakter / jumlah). */
export const STAT_LIMITS = { value: 20, label: 60, max: 6 } as const;
export const REVIEW_LIMITS = { quote: 600, name: 80, location: 80, role: 60 } as const;
export const INSTAGRAM_LIMITS = { imageAlt: 200, href: 500, max: 12 } as const;

export type StatItem = { key: string; value: string; label: string };
export type ReviewItem = {
  key: string;
  quote: string;
  name: string;
  location: string;
  role: string;
};
export type InstagramItem = {
  key: string;
  imageUrl: string;
  imageAlt: string;
  /** null → tautan profil Instagram. */
  href: string | null;
};

type OrderedRow = { isPublished: boolean; sortOrder: number };

/** Hanya baris terbit, urut `sortOrder` naik (stabil). */
function publishedInOrder<T extends OrderedRow>(rows: T[]): T[] {
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.isPublished)
    .sort((a, b) => a.row.sortOrder - b.row.sortOrder || a.index - b.index)
    .map(({ row }) => row);
}

export type StatRowLike = OrderedRow & { id: string; value: string; label: string };
export type ReviewRowLike = OrderedRow & {
  id: string;
  quote: string;
  name: string;
  location?: string | null;
  role?: string | null;
};
export type InstagramRowLike = OrderedRow & {
  id: string;
  imageUrl: string;
  imageAlt?: string | null;
  href?: string | null;
};

/** `null` = tabel kosong → pakai statistik statis lama. */
export function selectStats(rows: StatRowLike[]): StatItem[] | null {
  if (rows.length === 0) return null;
  return publishedInOrder(rows).map((row) => ({
    key: row.id,
    value: row.value.trim(),
    label: row.label.trim(),
  }));
}

/** `null` = tabel kosong → pakai ulasan statis lama. */
export function selectReviews(rows: ReviewRowLike[]): ReviewItem[] | null {
  if (rows.length === 0) return null;
  return publishedInOrder(rows).map((row) => ({
    key: row.id,
    quote: row.quote.trim(),
    name: row.name.trim(),
    location: clean(row.location),
    role: clean(row.role),
  }));
}

/**
 * `null` = tabel kosong → pertahankan grid foto bawaan. Foto dengan alamat
 * gambar tidak aman dibuang; tautan tidak aman jatuh ke tautan profil.
 */
export function selectInstagramPosts(rows: InstagramRowLike[]): InstagramItem[] | null {
  if (rows.length === 0) return null;
  return publishedInOrder(rows)
    .filter((row) => isSafeImageUrl(clean(row.imageUrl)))
    .slice(0, INSTAGRAM_LIMITS.max)
    .map((row) => {
      const href = clean(row.href);
      return {
        key: row.id,
        imageUrl: clean(row.imageUrl),
        imageAlt: clean(row.imageAlt),
        href: href && isSafeCtaHref(href) ? href : null,
      };
    });
}

/** Jumlah baris terbit (untuk peringatan admin "tidak ada yang tayang"). */
export function countPublished(rows: { isPublished: boolean }[]): number {
  return rows.filter((row) => row.isPublished).length;
}

export type SimpleValidation<T> = { ok: true; data: T } | { ok: false; error: string };

export type StatRawInput = { value?: string | null; label?: string | null; isPublished?: boolean };
export type StatData = { value: string; label: string; isPublished: boolean };

export function validateStatInput(raw: StatRawInput): SimpleValidation<StatData> {
  const value = clean(raw.value);
  const label = clean(raw.label);
  if (!value) return { ok: false, error: "Angka/nilai wajib diisi." };
  if (value.length > STAT_LIMITS.value) {
    return { ok: false, error: `Angka/nilai maksimal ${STAT_LIMITS.value} karakter.` };
  }
  if (!label) return { ok: false, error: "Label wajib diisi." };
  if (label.length > STAT_LIMITS.label) {
    return { ok: false, error: `Label maksimal ${STAT_LIMITS.label} karakter.` };
  }
  return { ok: true, data: { value, label, isPublished: raw.isPublished ?? false } };
}

export type ReviewRawInput = {
  quote?: string | null;
  name?: string | null;
  location?: string | null;
  role?: string | null;
  isPublished?: boolean;
};
export type ReviewData = {
  quote: string;
  name: string;
  location: string | null;
  role: string | null;
  isPublished: boolean;
};

export function validateReviewInput(raw: ReviewRawInput): SimpleValidation<ReviewData> {
  const quote = clean(raw.quote);
  const name = clean(raw.name);
  const location = clean(raw.location);
  const role = clean(raw.role);
  if (!quote) return { ok: false, error: "Isi ulasan wajib diisi." };
  if (quote.length > REVIEW_LIMITS.quote) {
    return { ok: false, error: `Isi ulasan maksimal ${REVIEW_LIMITS.quote} karakter.` };
  }
  if (!name) return { ok: false, error: "Nama pemberi ulasan wajib diisi." };
  if (name.length > REVIEW_LIMITS.name) {
    return { ok: false, error: `Nama maksimal ${REVIEW_LIMITS.name} karakter.` };
  }
  if (location.length > REVIEW_LIMITS.location) {
    return { ok: false, error: `Lokasi maksimal ${REVIEW_LIMITS.location} karakter.` };
  }
  if (role.length > REVIEW_LIMITS.role) {
    return { ok: false, error: `Keterangan maksimal ${REVIEW_LIMITS.role} karakter.` };
  }
  return {
    ok: true,
    data: {
      quote,
      name,
      location: location || null,
      role: role || null,
      isPublished: raw.isPublished ?? false,
    },
  };
}

export type InstagramRawInput = {
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string | null;
  isPublished?: boolean;
};
export type InstagramData = {
  imageUrl: string;
  imageAlt: string | null;
  href: string | null;
  isPublished: boolean;
};

export function validateInstagramInput(raw: InstagramRawInput): SimpleValidation<InstagramData> {
  const imageUrl = clean(raw.imageUrl);
  const imageAlt = clean(raw.imageAlt);
  const href = clean(raw.href);
  if (!imageUrl) return { ok: false, error: "Foto wajib diunggah atau dipilih." };
  if (!isSafeImageUrl(imageUrl)) return { ok: false, error: "Alamat gambar tidak valid." };
  if (imageAlt.length > INSTAGRAM_LIMITS.imageAlt) {
    return { ok: false, error: `Teks alt maksimal ${INSTAGRAM_LIMITS.imageAlt} karakter.` };
  }
  if (href.length > INSTAGRAM_LIMITS.href) {
    return { ok: false, error: `Tautan maksimal ${INSTAGRAM_LIMITS.href} karakter.` };
  }
  if (href && !isSafeCtaHref(href)) {
    return {
      ok: false,
      error: "Tautan harus berupa path internal (mis. /menu) atau alamat https://….",
    };
  }
  return {
    ok: true,
    data: {
      imageUrl,
      imageAlt: imageAlt || null,
      href: href || null,
      isPublished: raw.isPublished ?? false,
    },
  };
}
