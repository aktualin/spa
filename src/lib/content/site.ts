/**
 * Bacaan publik pengaturan situs (`SiteSettings`), template WhatsApp
 * (`WhatsAppTemplate`), dan menu navigasi (`MenuItem`).
 *
 * Fallback memakai konstanta statis (`src/data/content.ts` + `src/lib/whatsapp.ts`)
 * sehingga halaman tetap utuh ketika DB kosong atau tidak terjangkau.
 * Baris `SiteSettings` yang belum ada → seluruh nilai bawaan (bukan error).
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  mergeSiteSettings,
  type SiteSettings,
} from "@/lib/domain/site-settings";
import { MEMBER_MESSAGE, RESERVE_MESSAGE } from "@/lib/whatsapp";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type { SiteSettings };

/**
 * Pengaturan situs (alamat, jam, WA, email, sosial, maps, username IG, GA4).
 * Aturan fallback per field ada di `mergeSiteSettings` (domain/site-settings).
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
    mergeSiteSettings(null),
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

const STATIC_TEMPLATES: Record<string, string> = {
  default: RESERVE_MESSAGE,
  membership: MEMBER_MESSAGE,
  treatment: "Halo kak, saya mau reservasi {{treatment}}",
  retail: "Halo kak, saya mau pesan produk {{product}}",
};

/**
 * Template pesan WhatsApp untuk sebuah konteks ("default", "membership", …).
 * Mengembalikan `null` bila tidak ada template untuk key tersebut.
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
    STATIC_TEMPLATES[key] ?? null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
