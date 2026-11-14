/** Judul halaman SEO — lihat `seo.ts`. */
import type { Metadata } from "next";

import { SITE_NAME, TITLE_TEMPLATE } from "./seo.constants.ts";

/**
 * Judul halaman yang sudah memuat nama brand dipakai apa adanya (absolute),
 * supaya tidak menjadi "KAMA Spa … • KAMA Spa".
 */
export function pageTitle(title: string): NonNullable<Metadata["title"]> {
  const trimmed = title.trim();
  return trimmed.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? { absolute: trimmed }
    : trimmed;
}

/** Judul seperti yang tampil di tab browser / hasil pencarian. */
export function formatPageTitle(title: string): string {
  const resolved = pageTitle(title);
  return typeof resolved === "string"
    ? TITLE_TEMPLATE.replace("%s", resolved)
    : (resolved as { absolute: string }).absolute;
}

/** Mengambil teks dari nilai `Metadata["title"]` apa pun bentuknya. */
export function titleText(title: Metadata["title"]): string | undefined {
  if (!title) return undefined;
  if (typeof title === "string") return title;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return undefined;
}