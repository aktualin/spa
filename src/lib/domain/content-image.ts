/**
 * Gambar konten multi-slot (tabel ContentImage): satu entitas konten bisa
 * punya banyak gambar. Halaman publik merender satu gambar sebagai <img>
 * biasa dan lebih dari satu sebagai carousel (src/components/image-carousel.tsx).
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 */
import { CONTENT_TAGS } from "@/lib/content/tags";

/** Entitas yang slot gambarnya bisa banyak. Nilai = ContentImage.entityType. */
export const CONTENT_IMAGE_ENTITIES = [
  "treatment",
  "package",
  "event",
  "promo",
  "journal",
  "retail",
  "corporateProgram",
] as const;

export type ContentImageEntityType = (typeof CONTENT_IMAGE_ENTITIES)[number];

export function isContentImageEntityType(
  value: string,
): value is ContentImageEntityType {
  return (CONTENT_IMAGE_ENTITIES as readonly string[]).includes(value);
}

/**
 * Tag cache konten publik per entitas. Bacaan `src/lib/content/content-images.ts`
 * memakai tag ini, dan server action yang menulis wajib `updateTag(tag)` —
 * sama seperti kolom konten lain di tabel induknya.
 */
export const CONTENT_IMAGE_TAG: Record<ContentImageEntityType, string> = {
  treatment: CONTENT_TAGS.catalog,
  package: CONTENT_TAGS.catalog,
  event: CONTENT_TAGS.events,
  promo: CONTENT_TAGS.promos,
  journal: CONTENT_TAGS.journal,
  retail: CONTENT_TAGS.retail,
  corporateProgram: CONTENT_TAGS.corporate,
};

/** Batas wajar jumlah gambar per entitas (menjaga ukuran form & query). */
export const MAX_CONTENT_IMAGES = 12;

export type ContentImageRow = { imageUrl: string; altText: string | null };

/**
 * Form admin mengirim gambar sebagai `contentImages[0][imageUrl]`,
 * `contentImages[0][altText]`, dst. (pola sama dengan `options[i][…]` di
 * treatments). Baris tanpa URL dianggap dihapus admin; urutan mengikuti indeks.
 */
export function parseContentImageRows(formData: FormData): ContentImageRow[] {
  const rows = new Map<number, { imageUrl?: string; altText?: string }>();

  for (const [key, value] of formData.entries()) {
    const match = /^contentImages\[(\d+)]\[(imageUrl|altText)]$/.exec(key);
    if (!match) continue;
    const index = Number(match[1]);
    const row = rows.get(index) ?? {};
    if (match[2] === "imageUrl") row.imageUrl = String(value);
    else row.altText = String(value);
    rows.set(index, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => ({
      imageUrl: (row.imageUrl ?? "").trim(),
      altText: (row.altText ?? "").trim() || null,
    }))
    .filter((row) => row.imageUrl !== "")
    .slice(0, MAX_CONTENT_IMAGES);
}
