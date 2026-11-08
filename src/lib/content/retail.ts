/**
 * Bacaan publik katalog Retail (modul 8).
 *
 * Tidak ada keranjang/pembayaran online — pemesanan lewat WhatsApp.
 * Kalau DB kosong/down, daftar produk statis (kosong) dipakai sehingga
 * halaman tetap menampilkan pesan "Produk segera hadir".
 */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type RetailProduct = {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceIdr: number | null;
  isHighlight: boolean;
  whatsappMessage: string | null;
};

/** Fallback statis: belum ada produk retail yang dipublikasikan. */
function staticRetailProducts(): RetailProduct[] {
  return [];
}

/** Semua produk retail yang published, highlight lebih dulu. */
export async function getRetailProducts(): Promise<RetailProduct[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.retail);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.retailProduct.findMany({
      where: { isPublished: true },
      orderBy: [{ isHighlight: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
    if (rows.length === 0) throw new Error("belum ada produk retail");
    return rows.map<RetailProduct>((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      priceIdr: p.priceIdr,
      isHighlight: p.isHighlight,
      whatsappMessage: p.whatsappMessage,
    }));
  }, staticRetailProducts());

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Produk retail yang ditandai highlight (dipakai bagian atas halaman). */
export async function getHighlightedRetailProducts(): Promise<RetailProduct[]> {
  const all = await getRetailProducts();
  const highlighted = all.filter((p) => p.isHighlight);
  return highlighted.length > 0 ? highlighted : all.slice(0, 3);
}
