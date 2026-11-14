/** Tipe bacaan publik Journal — lihat `journal.ts`. */

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  bodyHtml: string | null;
  coverUrl: string | null;
  category: string | null;
  tags: string[];
  publishedAt: Date | null;
  updatedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/**
 * Baris Prisma: kategori ikut lewat relasi `category`, bukan kolom teks.
 * `JournalPost.category` di luar sini tetap berupa nama kategori (string),
 * supaya filter `?category=` dan tampilan kartu tidak berubah.
 */
export type JournalRow = Omit<JournalPost, "bodyHtml" | "category"> & {
  bodyHtml: string;
  category: { name: string } | null;
};

export function toJournalPost(row: JournalRow): JournalPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    bodyHtml: row.bodyHtml,
    coverUrl: row.coverUrl,
    category: row.category?.name ?? null,
    tags: row.tags,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}