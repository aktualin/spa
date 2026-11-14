/** Validasi isian konten halaman /corporate — lihat `corporate.ts`. */
import { hasVisibleText } from "./corporate.content.ts";
import type { CorporateSolution } from "./corporate.types.ts";
import {
  CORPORATE_LIMITS,
  checkList,
  cleanList,
  type Validation,
} from "./corporate.validation.ts";
import { richTextLength } from "./rich-text.ts";
import { collapseSpaces } from "./text.ts";

/**
 * Blok "solutions" dari form: judul per blok + isi per blok (satu item per
 * baris). Blok tanpa judul dan tanpa isi diabaikan; blok berisi tanpa judul
 * ditolak.
 */
export function parseSolutionsInput(
  titles: readonly string[],
  itemsText: readonly string[],
): Validation<CorporateSolution[]> {
  const solutions: CorporateSolution[] = [];
  const count = Math.max(titles.length, itemsText.length);
  for (let i = 0; i < count; i += 1) {
    const title = collapseSpaces(titles[i] ?? "");
    const items = cleanList((itemsText[i] ?? "").split(/\r?\n/));
    if (!title && items.length === 0) continue;
    if (!title) return { ok: false, error: `Blok solusi ke-${i + 1} belum punya judul.` };
    if (title.length > CORPORATE_LIMITS.listItem) {
      return { ok: false, error: `Judul blok solusi maksimal ${CORPORATE_LIMITS.listItem} karakter.` };
    }
    const listError = checkList(items, "poin per blok solusi", CORPORATE_LIMITS.maxSolutionItems);
    if (listError) return { ok: false, error: listError };
    solutions.push({ title, items });
  }
  if (solutions.length > CORPORATE_LIMITS.maxSolutions) {
    return { ok: false, error: `Maksimal ${CORPORATE_LIMITS.maxSolutions} blok solusi.` };
  }
  return { ok: true, data: solutions };
}

export type ContentInput = {
  heroTitle: string;
  intro: string;
  benefits: readonly string[];
  solutionTitles: readonly string[];
  solutionItems: readonly string[];
  inSpaItems: readonly string[];
};

export type ContentData = {
  heroTitle: string;
  intro: string | null;
  benefits: string[];
  solutions: CorporateSolution[];
  inSpaItems: string[];
};

export function validateContentInput(input: ContentInput): Validation<ContentData> {
  const heroTitle = input.heroTitle.trim();
  if (!heroTitle) return { ok: false, error: "Judul hero wajib diisi." };
  if (heroTitle.length > CORPORATE_LIMITS.heroTitle) {
    return { ok: false, error: `Judul hero maksimal ${CORPORATE_LIMITS.heroTitle} karakter.` };
  }
  const intro = input.intro.trim();
  if (richTextLength(intro) > CORPORATE_LIMITS.intro) {
    return { ok: false, error: `Intro maksimal ${CORPORATE_LIMITS.intro} karakter.` };
  }

  const benefits = cleanList(input.benefits);
  const benefitError = checkList(benefits, "benefit", CORPORATE_LIMITS.maxBenefits);
  if (benefitError) return { ok: false, error: benefitError };

  const inSpaItems = cleanList(input.inSpaItems);
  const inSpaError = checkList(inSpaItems, "item In-Spa", CORPORATE_LIMITS.maxInSpaItems);
  if (inSpaError) return { ok: false, error: inSpaError };

  const solutions = parseSolutionsInput(input.solutionTitles, input.solutionItems);
  if (!solutions.ok) return solutions;

  return {
    ok: true,
    data: { heroTitle, intro: intro || null, benefits, solutions: solutions.data, inSpaItems },
  };
}

/**
 * HTML opsional dari editor: tanpa teks terlihat → null; sama dengan isi
 * bawaan → null (supaya halaman tetap memakai markup asli).
 */
export function optionalHtml(html: string, defaultHtml?: string): string | null {
  if (!hasVisibleText(html)) return null;
  const normalize = (value: string) => value.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  if (defaultHtml && normalize(html) === normalize(defaultHtml)) return null;
  return html;
}