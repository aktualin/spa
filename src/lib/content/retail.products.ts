/** Bacaan produk retail publik — lihat `retail.ts`. */
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
  isCollaboration: boolean;
  whatsappMessage: string | null;
};

/** Produk retail siap tampil, lengkap dengan link "Pesan via WhatsApp". */
export type RetailCatalogItem = RetailProduct & { whatsappUrl: string };

/** Semua produk retail yang ditampilkan, Highlight/Kolaborasi lebih dulu. */
export async function getRetailProducts(): Promise<RetailProduct[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.retail);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.retailProduct.findMany({
      where: { isPublished: true },
      // Sama dengan `compareRetailProducts` di domain/retail (urutan admin).
      orderBy: [
        { isHighlight: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
        { id: "asc" },
      ],
    });
    return rows.map<RetailProduct>((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      priceIdr: p.priceIdr,
      isHighlight: p.isHighlight,
      isCollaboration: p.isCollaboration,
      whatsappMessage: p.whatsappMessage,
    }));
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}