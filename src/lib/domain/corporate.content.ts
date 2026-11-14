/** Penggabungan database + fallback konten /corporate — lihat `corporate.ts`. */
import { isRecord } from "./record.ts";
import type {
  CorporateContentRow,
  CorporatePageContent,
  CorporateSolution,
} from "./corporate.types.ts";

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** true bila HTML memuat teks yang terlihat (bukan sekadar tag kosong). */
export function hasVisibleText(html: string | null | undefined): boolean {
  if (!html) return false;
  const text = html
    .replace(/<img\b[^>]*>/gi, "x")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ");
  return /\S/.test(text);
}

/** Kolom JSON `solutions` → daftar blok; entri rusak dibuang. */
export function readSolutions(value: unknown): CorporateSolution[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim()) return [];
    const items = Array.isArray(item.items)
      ? item.items.filter((v): v is string => typeof v === "string" && v.trim() !== "")
      : [];
    return [{ title: item.title, items }];
  });
}

/** Konten kosong: belum disimpan admin → halaman menyembunyikan bagiannya. */
export function emptyCorporateContent(): CorporatePageContent {
  return {
    heroTitle: "",
    intro: "",
    benefits: [],
    solutions: [],
    inSpaItems: [],
    inSpaHtml: null,
    inOfficeHtml: null,
    stepsHtml: null,
    pic: { name: "", email: "", phone: "" },
    heroImageUrl: null,
    heroImageAlt: null,
    aboutImageUrl: null,
    aboutImageAlt: null,
    inSpaImageUrl: null,
    inSpaImageAlt: null,
  };
}

/**
 * Baris `CorporateContent` → isi halaman. Tanpa fallback statis: kolom yang
 * belum diisi admin tetap kosong dan halaman menyembunyikan bagian itu.
 */
export function resolveCorporateContent(row: CorporateContentRow | null): CorporatePageContent {
  if (!row) return emptyCorporateContent();

  return {
    heroTitle: nonEmpty(row.heroTitle) ?? "",
    intro: nonEmpty(row.intro) ?? "",
    benefits: (row.benefits ?? []).filter((b) => b.trim() !== ""),
    solutions: readSolutions(row.solutions),
    inSpaItems: (row.inSpaItems ?? []).filter((b) => b.trim() !== ""),
    inSpaHtml: hasVisibleText(row.inSpaHtml) ? row.inSpaHtml : null,
    inOfficeHtml: hasVisibleText(row.inOfficeHtml) ? row.inOfficeHtml : null,
    stepsHtml: hasVisibleText(row.stepsHtml) ? row.stepsHtml : null,
    pic: {
      name: nonEmpty(row.picName) ?? "",
      email: nonEmpty(row.picEmail) ?? "",
      phone: nonEmpty(row.picPhone) ?? "",
    },
    heroImageUrl: nonEmpty(row.heroImageUrl),
    heroImageAlt: nonEmpty(row.heroImageAlt),
    aboutImageUrl: nonEmpty(row.aboutImageUrl),
    aboutImageAlt: nonEmpty(row.aboutImageAlt),
    inSpaImageUrl: nonEmpty(row.inSpaImageUrl),
    inSpaImageAlt: nonEmpty(row.inSpaImageAlt),
  };
}