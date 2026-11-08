/**
 * Bacaan publik katalog Retail (modul 8).
 *
 * Tidak ada keranjang/pembayaran online — pemesanan lewat WhatsApp.
 * Fallback statis (kosong → "Belum ada produk retail") hanya dipakai bila DB
 * tidak terbaca atau tabel produk benar-benar kosong. Kalau semua produk
 * sedang disembunyikan, hasilnya daftar kosong dari DB — bukan fallback.
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
  whatsappMessage: string | null;
};

/** Produk retail siap tampil, lengkap dengan link "Pesan via WhatsApp". */
export type RetailCatalogItem = RetailProduct & { whatsappUrl: string };

/** Fallback statis: belum ada produk retail yang dipublikasikan. */
function staticRetailProducts(): RetailProduct[] {
  return [];
}

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
    if (rows.length === 0 && (await prisma.retailProduct.count()) === 0) {
      throw new Error("tabel produk retail kosong");
    }
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

/** Produk retail yang ditandai highlight (dipakai bagian atas halaman). */
export async function getHighlightedRetailProducts(): Promise<RetailProduct[]> {
  const all = await getRetailProducts();
  const highlighted = all.filter((p) => p.isHighlight);
  return highlighted.length > 0 ? highlighted : all.slice(0, 3);
}
