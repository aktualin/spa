/**
 * Bacaan publik pengaturan situs (`SiteSettings`), template WhatsApp
 * (`WhatsAppTemplate`), dan menu navigasi (`MenuItem`).
 *
 * Tanpa fallback konten statis: baris yang belum ada atau DB tak terjangkau
 * menghasilkan nilai kosong, dan halaman publik menampilkan empty state.
 */
import { cacheLife, cacheTag } from "next/cache";

import { type SiteSettings } from "@/lib/domain/site-settings";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { getSiteSettings } from "./site.settings";
import { CONTENT_TAGS } from "./tags";

export type { SiteSettings };
export { getSiteSettings } from "./site.settings";

/** Nomor WhatsApp global (digit saja) — dipakai link `wa.me`. */
export async function getWhatsAppNumber(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.whatsappNumber;
}

/* ---------- template pesan WhatsApp ---------- */

/**
 * Template pesan WhatsApp untuk sebuah konteks ("default", "membership", …).
 * Mengembalikan `null` bila admin belum mengisi template — `resolveWhatsAppMessage`
 * yang kemudian memakai teks bawaan konteks.
 */
export async function getWhatsAppTemplate(
  key: string,
): Promise<string | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<string | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.whatsAppTemplate.findUnique({
        where: { key },
      });
      if (!row || !row.message.trim()) return null;
      return row.message;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}