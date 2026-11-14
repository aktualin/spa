"use client";

import { journalPath, seoLengthState, type SeoLengthState } from "@/lib/domain/journal";

const seoTone: Record<SeoLengthState, string> = {
  empty: "text-neutral-500",
  short: "text-amber-700",
  ideal: "text-green-700",
  long: "font-medium text-red-700",
};

const seoText: Record<SeoLengthState, string> = {
  empty: "memakai nilai bawaan",
  short: "terlalu pendek",
  ideal: "panjang ideal",
  long: "terlalu panjang, bisa terpotong di Google",
};

/** Indikator panjang teks SEO (jumlah karakter + status). */
export function SeoCounter({ value, ideal }: { value: string; ideal: number }) {
  const state = seoLengthState(value.trim().length, ideal);
  return (
    <span className={seoTone[state]}>
      {value.trim().length}/{ideal} karakter · {seoText[state]}
    </span>
  );
}

/** Perkiraan tampilan artikel di hasil pencarian Google. */
export function SeoGooglePreview({
  seoTitle,
  seoDescription,
  title,
  excerpt,
  effectiveSlug,
}: {
  seoTitle: string;
  seoDescription: string;
  title: string;
  excerpt: string;
  effectiveSlug: string;
}) {
  return (
    <div className="rounded-md bg-neutral-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-neutral-500">
        Perkiraan tampilan di Google
      </p>
      <p className="mt-1 truncate text-sm text-blue-800">
        {seoTitle.trim() || title.trim() || "Judul artikel"}
      </p>
      <p className="truncate text-xs text-green-800">
        {journalPath(effectiveSlug || "slug-artikel")}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">
        {seoDescription.trim() || excerpt.trim() || "Ringkasan artikel akan tampil di sini."}
      </p>
    </div>
  );
}