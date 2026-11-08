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
