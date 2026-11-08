/**
 * Bacaan publik pengaturan situs (`SiteSettings`), template WhatsApp
 * (`WhatsAppTemplate`), dan menu navigasi (`MenuItem`).
 *
 * Fallback memakai konstanta statis (`src/data/content.ts` + `src/lib/whatsapp.ts`)
 * sehingga halaman tetap utuh ketika DB kosong atau tidak terjangkau.
 */
import { cacheLife, cacheTag } from "next/cache";

import { site as staticSite } from "@/data/content";
import {
  MEMBER_MESSAGE,
  RESERVE_MESSAGE,
  WHATSAPP_NUMBER,
} from "@/lib/whatsapp";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type SiteSettings = {
  address: string;
  openingHours: string[];
  whatsappNumber: string;
  email: string;
  phone: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  freshaUrl: string;
  mapsEmbedUrl: string;
};

/** Nilai default — sama persis dengan data statis yang dipakai halaman lama. */
function staticSettings(): SiteSettings {
  return {
    address: staticSite.address,
    openingHours: [staticSite.hours],
    whatsappNumber: WHATSAPP_NUMBER,
    email: staticSite.email,
    phone: staticSite.phone,
    instagramUrl: staticSite.instagram,
    tiktokUrl: staticSite.tiktok,
    facebookUrl: "",
    freshaUrl: "",
    mapsEmbedUrl: "",
  };
}

/** Pengaturan situs (alamat, jam, WA, email, sosial, maps). */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<SiteSettings>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
      });
      if (!row) throw new Error("pengaturan situs kosong");
      const fallback = staticSettings();
      return {
        address: row.address?.trim() || fallback.address,
        openingHours:
          row.openingHours && row.openingHours.length > 0
            ? row.openingHours
            : fallback.openingHours,
        whatsappNumber: (row.whatsappNumber || "").replace(/\D/g, "") || fallback.whatsappNumber,
        email: row.email?.trim() || fallback.email,
        phone: row.phone?.trim() || fallback.phone,
        instagramUrl: row.instagramUrl?.trim() || fallback.instagramUrl,
        tiktokUrl: row.tiktokUrl?.trim() || fallback.tiktokUrl,
        facebookUrl: row.facebookUrl?.trim() || fallback.facebookUrl,
        freshaUrl: row.freshaUrl?.trim() || fallback.freshaUrl,
        mapsEmbedUrl: row.mapsEmbedUrl?.trim() || fallback.mapsEmbedUrl,
      };
    },
    staticSettings(),
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

/* ---------- menu navigasi ---------- */

export type MenuItemNode = {
  id: string;
  label: string;
  url: string;
  openInNew: boolean;
  children: MenuItemNode[];
};

/**
 * Menu navigasi dari DB (satu level anak). Fallback `null` — pemanggil
 * memakai data statis `nav` dari `src/data/content.ts`.
 */
export async function getMenuItems(): Promise<MenuItemNode[] | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.menu);

  const { data, usedFallback } = await safeQueryWithMeta<MenuItemNode[] | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.menuItem.findMany({
        where: { isVisible: true, parentId: null },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        include: {
          children: {
            where: { isVisible: true },
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
          },
        },
      });
      if (rows.length === 0) throw new Error("menu kosong");
      return rows.map((row) => ({
        id: row.id,
        label: row.label,
        url: row.url,
        openInNew: row.openInNew,
        children: row.children.map((child) => ({
          id: child.id,
          label: child.label,
          url: child.url,
          openInNew: child.openInNew,
          children: [],
        })),
      }));
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
