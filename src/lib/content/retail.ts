/**
 * Bacaan publik katalog Retail (modul 8).
 *
 * Tidak ada keranjang/pembayaran online — pemesanan lewat WhatsApp.
 * Tabel kosong atau semua produk disembunyikan → daftar kosong (empty state
 * di halaman), bukan produk contoh.
 */
import { waLink } from "@/lib/whatsapp";

import { retailMessage } from "./retail.message";
import {
  type RetailCatalogItem,
  type RetailProduct,
  getRetailProducts,
} from "./retail.products";
import { getWhatsAppNumber, getWhatsAppTemplate } from "./site";

export type { RetailProduct, RetailCatalogItem } from "./retail.products";
export { getRetailProducts } from "./retail.products";

/**
 * Katalog untuk halaman /retail: produk tampil + link WhatsApp per produk.
 * Nomor mengikuti pengaturan Kontak & Umum.
 */
export async function getRetailCatalog(): Promise<RetailCatalogItem[]> {
  const [products, number, template] = await Promise.all([
    getRetailProducts(),
    getWhatsAppNumber(),
    getWhatsAppTemplate("retail"),
  ]);
  return products.map((product) => ({
    ...product,
    whatsappUrl: waLink(retailMessage(product, template), number),
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