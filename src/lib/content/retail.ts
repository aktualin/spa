/**
 * Bacaan publik katalog Retail (modul 8).
 *
 * Tidak ada keranjang/pembayaran online — pemesanan lewat WhatsApp.
 * Tabel kosong atau semua produk disembunyikan → daftar kosong (empty state
 * di halaman), bukan produk contoh.
 */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";
import { retailOrderMessage } from "@/lib/domain/retail";
import { waLink } from "@/lib/whatsapp";

import { getWhatsAppNumber, getWhatsAppTemplate } from "./site";
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

/**
 * Katalog untuk halaman /retail: produk tampil + link WhatsApp per produk.
 * Pesan memakai `whatsappMessage` produk, atau template "retail" dari modul
 * Kontak & Umum, atau template bawaan (nama produk + harga bila ada). Nomor
 * mengikuti pengaturan Kontak & Umum.
 */
export async function getRetailCatalog(): Promise<RetailCatalogItem[]> {
  const [products, number, template] = await Promise.all([
    getRetailProducts(),
    getWhatsAppNumber(),
    getWhatsAppTemplate("retail"),
  ]);
  return products.map((product) => ({
    ...product,
    whatsappUrl: waLink(retailOrderMessage(product, template), number),
  }));
}

/**
 * Produk yang ditandai highlight. Tidak ada yang ditandai → kosong, bukan
 * produk sembarang, supaya bagian highlight benar-benar pilihan admin.
 */
export async function getHighlightedRetailProducts(): Promise<RetailProduct[]> {
  const all = await getRetailProducts();
  return all.filter((p) => p.isHighlight);
}

/** Produk hasil kolaborasi, ditandai terpisah dari highlight. */
export async function getCollaborationRetailProducts(): Promise<RetailProduct[]> {
  const all = await getRetailProducts();
  return all.filter((p) => p.isCollaboration);
}
