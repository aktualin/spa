/**
 * Bacaan publik pengaturan situs (`SiteSettings`), template WhatsApp
 * (`WhatsAppTemplate`), dan menu navigasi (`MenuItem`).
 *
 * Tanpa fallback konten statis: baris yang belum ada atau DB tak terjangkau
 * menghasilkan nilai kosong, dan halaman publik menampilkan empty state.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  emptySiteSettings,
  mergeSiteSettings,
  type SiteSettings,
} from "@/lib/domain/site-settings";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type { SiteSettings };

/**
 * Pengaturan situs (alamat, jam, WA, email, sosial, maps, username IG, GA4).
 * Kolom yang belum diisi admin dikembalikan kosong — lihat `mergeSiteSettings`.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<SiteSettings>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: {
          address: true,
          mapsEmbedUrl: true,
          openingHours: true,
          whatsappNumber: true,
          email: true,
          phone: true,
          instagramUrl: true,
          instagramUsername: true,
          tiktokUrl: true,
          facebookUrl: true,
          freshaUrl: true,
          ga4MeasurementId: true,
        },
      });
      return mergeSiteSettings(row);
    },
    emptySiteSettings(),
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

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
